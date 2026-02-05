"""
Legal Transaction Engine - Core Business Logic

This module contains the "engine" that orchestrates credit agreement closings:
- Creating and managing transactions
- Tracking document delivery
- Managing conditions precedent
- Generating checklists
- Status reporting
- Version control and audit logging (Gwern-inspired)
- Defined terms tracking and validation
"""

from datetime import datetime, date
from typing import Optional
from pathlib import Path
import uuid

from models import (
    Transaction, Document, Party, ConditionPrecedent, ChecklistItem,
    TransactionType, DocumentType, DocumentStatus, PartyRole, ConditionStatus
)
from store import DataStore

# Import ontology system
from ontology import CreditAgreementOntology
from relationships import RelationshipStore, Relationship, RelationshipType # pyright: ignore[reportMissingImports]

# Import versioning system (Gwern-inspired features)
try:
    from versioning import VersionControl, AuditLog, SnapshotManager, DocumentArchive
    VERSIONING_AVAILABLE = True
except ImportError:
    VERSIONING_AVAILABLE = False

# Import defined terms system
try:
    from terms import (
        DefinedTermsParser, DefinedTermsStore, DefinedTermsAnalyzer,
        DefinedTerm, TermUsage, TermCategory, TermSource, SAMPLE_DEFINITIONS
    )
    TERMS_AVAILABLE = True
except ImportError:
    TERMS_AVAILABLE = False

# Import term edges system (atomized relationships)
try:
    from term_edges import (
        TermEdgeStore, TermEdgeExtractor, TermGraphAnalyzer,
        TermEdge, TermEdgeType, rebuild_edges_from_terms
    )
    TERM_EDGES_AVAILABLE = True
except ImportError:
    TERM_EDGES_AVAILABLE = False

# Import file watcher system
try:
    from filewatcher import (
        SmartChecklist, FolderScanner, TransactionFolderManager,
        ChecklistSummary, FileStatus
    )
    FILEWATCHER_AVAILABLE = True
except ImportError:
    FILEWATCHER_AVAILABLE = False


class TransactionEngine:
    """
    Core engine for managing credit agreement transactions.
    
    This class provides the business logic layer above the data store,
    handling operations like:
    - Creating new transactions with standard document sets
    - Tracking conditions precedent satisfaction
    - Generating closing checklists
    - Computing status summaries
    - Version control and audit logging (Gwern-inspired)
    """
    
    def __init__(self, data_dir: str = "./data", enable_versioning: bool = True):
        self.data_dir = Path(data_dir)
        self.store = DataStore(data_dir)

        # Relationship index: explicit graph of connections between entities
        self.relationship_store = RelationshipStore(data_dir)


        # Ontology: external declarative config for standard docs/conditions
        try:
            self.ontology = CreditAgreementOntology.load("credit_agreement_v1")
        except Exception as exc:
            # For now, fail fast if the ontology is missing or invalid
            raise RuntimeError(f"Failed to load credit agreement ontology: {exc}") from exc
        
        # Initialize Gwern-inspired versioning system
        self.versioning_enabled = enable_versioning and VERSIONING_AVAILABLE
        if self.versioning_enabled:
            self.version_control = VersionControl(str(self.data_dir))
            self.audit_log = AuditLog(str(self.data_dir / "audit"))
            self.snapshot_manager = SnapshotManager(
                str(self.data_dir),
                str(self.data_dir.parent / "snapshots")
            )
            self.document_archive = DocumentArchive(
                str(self.data_dir.parent / "archive")
            )
        else:
            self.version_control = None
            self.audit_log = None
            self.snapshot_manager = None
            self.document_archive = None
        
        # Initialize defined terms system
        self.terms_enabled = TERMS_AVAILABLE
        if self.terms_enabled:
            self.terms_store = DefinedTermsStore(str(self.data_dir / "terms"))
            self.terms_parser = DefinedTermsParser()
            self.terms_analyzer = DefinedTermsAnalyzer(self.terms_store)
        else:
            self.terms_store = None
            self.terms_parser = None
            self.terms_analyzer = None
        
        # Initialize term edges system (atomized relationships)
        self.term_edges_enabled = TERM_EDGES_AVAILABLE and self.terms_enabled
        if self.term_edges_enabled:
            self.term_edge_store = TermEdgeStore(str(self.data_dir / "terms"))
            self.term_graph_analyzer = TermGraphAnalyzer(self.term_edge_store)
        else:
            self.term_edge_store = None
            self.term_graph_analyzer = None
        
        # Initialize file watcher system
        self.filewatcher_enabled = FILEWATCHER_AVAILABLE
        self.docs_folder = self.data_dir.parent / "documents"
        if self.filewatcher_enabled:
            self.folder_manager = TransactionFolderManager(str(self.docs_folder))
            self.smart_checklist = SmartChecklist(self, str(self.docs_folder))
        else:
            self.folder_manager = None
            self.smart_checklist = None
    
    def _log_action(self, action: str, entity_type: str, entity_id: str, changes: dict = None):
        """Log an action to the audit log and commit to git."""
        if not self.versioning_enabled:
            return
        
        # Commit to git
        git_commit = None
        if self.version_control:
            git_commit = self.version_control.commit_change(
                action, entity_type, entity_id
            )
        
        # Log to audit trail
        if self.audit_log:
            self.audit_log.log(
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                changes=changes or {},
                git_commit=git_commit
            )
    
    # =========================================================================
    # TRANSACTION MANAGEMENT
    # =========================================================================
    
    def create_transaction(
        self,
        name: str,
        transaction_type: TransactionType = TransactionType.REVOLVING_CREDIT,
        facility_amount: float = 0.0,
        closing_date: Optional[date] = None,
        create_standard_documents: bool = True,
        create_standard_conditions: bool = True,
    ) -> Transaction:
        """
        Create a new transaction with optional standard documents and conditions.
        
        Args:
            name: Deal name (e.g., "XYZ Corp $100M Revolving Credit Facility")
            transaction_type: Type of facility
            facility_amount: Facility size
            closing_date: Target closing date
            create_standard_documents: Auto-create standard closing documents
            create_standard_conditions: Auto-create standard conditions precedent
        
        Returns:
            The created Transaction object
        """
        txn = Transaction(
            name=name,
            transaction_type=transaction_type,
            facility_amount=facility_amount,
            closing_date=closing_date,
        )
        
        self.store.save_transaction(txn)
        
        # Log the creation
        self._log_action("CREATE", "transaction", txn.id, {
            "name": name,
            "facility_amount": facility_amount,
            "closing_date": str(closing_date) if closing_date else None,
        })
        
        doc_key_map: Optional[dict[str, str]] = None

        if create_standard_documents:
            doc_key_map = self._create_standard_documents(txn)

        if create_standard_conditions:
            self._create_standard_conditions(txn, doc_key_map=doc_key_map)

        return self.store.get_transaction(txn.id)

 
    def _create_standard_documents(self, txn: Transaction) -> dict[str, str]:
        
        # Create the standard set of closing documents for a transaction. 
        #Returns:A mapping from ontology document key -> created Document.id for use in building the relationship index.
        
        if not hasattr(self, "ontology") or self.ontology is None:
            raise RuntimeError("Ontology is not loaded on TransactionEngine")

        key_to_id: dict[str, str] = {}
        doc_ids: list[str] = []

        for key, tmpl in self.ontology.document_templates.items():
            # Resolve due date from the transaction if configured, otherwise None
            due_date = getattr(txn, tmpl.default_due_date_field) if tmpl.default_due_date_field else None

            doc = Document(
                document_type=tmpl.document_type,
                title=tmpl.default_title,
                status=DocumentStatus.NOT_STARTED,
                due_date=due_date,
            )
            self.store.save_document(doc)

            key_to_id[key] = doc.id
            doc_ids.append(doc.id)

        txn.document_ids = doc_ids
        self.store.save_transaction(txn)
        return key_to_id

    
    def _create_standard_conditions(
        self,
        txn: Transaction,
        doc_key_map: Optional[dict[str, str]] = None,
    ):
        # Create standard conditions precedent from the ontology configuration.

        # Records explicit relationships between expected documents and conditions in the relationship index when a doc_key_map is provided.
        
        if not hasattr(self, "ontology") or self.ontology is None:
            raise RuntimeError("Ontology is not loaded on TransactionEngine")

        cond_ids: list[str] = []
        relationships: list[Relationship] = []

        for tmpl in self.ontology.condition_templates:
            cond = ConditionPrecedent(
                section_reference=tmpl.section_reference,
                title=tmpl.title,
                description=tmpl.description,
                category=tmpl.category,
                status=ConditionStatus.PENDING,
            )
            self.store.save_condition(cond)
            cond_ids.append(cond.id)

            # Build relationships from expected documents -> this condition
            if doc_key_map:
                for doc_key in tmpl.expected_document_keys:
                    doc_id = doc_key_map.get(doc_key)
                    if not doc_id:
                        continue
                    relationships.append(
                        Relationship.create(
                            from_type="document",
                            from_id=doc_id,
                            relation=RelationshipType.EXPECTED_DOC_FOR_CONDITION,
                            to_type="condition",
                            to_id=cond.id,
                            transaction_id=txn.id,
                        )
                    )

        txn.condition_ids = cond_ids
        self.store.save_transaction(txn)

        if relationships:
            self.relationship_store.add_many(relationships)

        return cond_ids

    
    # =========================================================================
    # PARTY MANAGEMENT
    # =========================================================================
    
    def add_party(
        self,
        txn_id: str,
        name: str,
        roles: list[PartyRole],
        short_name: str = "",
        jurisdiction: str = "",
        entity_type: str = "",
    ) -> Party:
        """Add a party to a transaction."""
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        party = Party(
            name=name,
            short_name=short_name or name,
            roles=roles,
            jurisdiction=jurisdiction,
            entity_type=entity_type,
        )
        
        self.store.save_party(party)
        
        # Update transaction party list
        if party.id not in txn.party_ids:
            txn.party_ids.append(party.id)
        
        # Set borrower/agent references if applicable
        if PartyRole.BORROWER in roles and not txn.borrower_id:
            txn.borrower_id = party.id
        if PartyRole.ADMINISTRATIVE_AGENT in roles and not txn.agent_id:
            txn.agent_id = party.id
        
        self.store.save_transaction(txn)
        return party
    
    # =========================================================================
    # DOCUMENT MANAGEMENT
    # =========================================================================
    
    def add_document(
        self,
        txn_id: str,
        document_type: DocumentType,
        title: str,
        responsible_party_id: Optional[str] = None,
        due_date: Optional[date] = None,
    ) -> Document:
        """Add a document to a transaction."""
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        doc = Document(
            document_type=document_type,
            title=title,
            responsible_party_id=responsible_party_id,
            due_date=due_date or txn.closing_date,
        )
        
        self.store.save_document(doc)
        
        if doc.id not in txn.document_ids:
            txn.document_ids.append(doc.id)
            self.store.save_transaction(txn)
        
        return doc
    
    def update_document_status(
        self,
        doc_id: str,
        status: DocumentStatus,
        notes: str = "",
    ) -> Document:
        """Update a document's status."""
        doc = self.store.get_document(doc_id)
        if not doc:
            raise ValueError(f"Document {doc_id} not found")
        
        old_status = doc.status.value if hasattr(doc.status, 'value') else str(doc.status)
        doc.status = status
        if notes:
            doc.notes = notes
        
        # Auto-set dates based on status
        if status == DocumentStatus.FINAL:
            doc.received_date = date.today()
        elif status == DocumentStatus.EXECUTED:
            doc.execution_date = date.today()
        
        self.store.save_document(doc)
        
        # Log the status change
        self._log_action("UPDATE", "document", doc_id, {
            "field": "status",
            "old_value": old_status,
            "new_value": status.value,
            "title": doc.title,
        })
        
        return doc
    
    def link_document_to_condition(self, doc_id: str, cond_id: str):
        """Link a document to a condition it satisfies."""
        doc = self.store.get_document(doc_id)
        cond = self.store.get_condition(cond_id)
        
        if not doc:
            raise ValueError(f"Document {doc_id} not found")
        if not cond:
            raise ValueError(f"Condition {cond_id} not found")
        
        if cond_id not in doc.satisfies_condition_ids:
            doc.satisfies_condition_ids.append(cond_id)
            self.store.save_document(doc)
        
        if doc_id not in cond.satisfied_by_document_ids:
            cond.satisfied_by_document_ids.append(doc_id)
            self.store.save_condition(cond)
    
    # =========================================================================
    # CONDITION MANAGEMENT
    # =========================================================================
    
    def update_condition_status(
        self,
        cond_id: str,
        status: ConditionStatus,
        notes: str = "",
    ) -> ConditionPrecedent:
        """Update a condition's status."""
        cond = self.store.get_condition(cond_id)
        if not cond:
            raise ValueError(f"Condition {cond_id} not found")
        
        old_status = cond.status.value if hasattr(cond.status, 'value') else str(cond.status)
        cond.status = status
        if notes:
            cond.notes = notes
        
        self.store.save_condition(cond)
        
        # Log the status change
        self._log_action("UPDATE", "condition", cond_id, {
            "field": "status",
            "old_value": old_status,
            "new_value": status.value,
            "title": cond.title,
        })
        
        return cond
    
    def satisfy_condition(self, cond_id: str, doc_ids: list[str] = None):
        """Mark a condition as satisfied, optionally linking documents."""
        cond = self.store.get_condition(cond_id)
        if not cond:
            raise ValueError(f"Condition {cond_id} not found")
        
        if doc_ids:
            for doc_id in doc_ids:
                self.link_document_to_condition(doc_id, cond_id)
        
        cond.status = ConditionStatus.SATISFIED
        self.store.save_condition(cond)
    
    def waive_condition(
        self,
        cond_id: str,
        waiver_date: Optional[date] = None,
        waiver_document_id: Optional[str] = None,
    ):
        """Mark a condition as waived."""
        cond = self.store.get_condition(cond_id)
        if not cond:
            raise ValueError(f"Condition {cond_id} not found")
        
        cond.status = ConditionStatus.WAIVED
        cond.waived_date = waiver_date or date.today()
        if waiver_document_id:
            cond.waiver_document_id = waiver_document_id
        
        self.store.save_condition(cond)
    
    # =========================================================================
    # CHECKLIST GENERATION
    # =========================================================================
    
    def generate_checklist(self, txn_id: str) -> list[dict]:
        """
        Generate a closing checklist for a transaction.
        
        Returns a structured list of checklist items with documents,
        conditions, and status information.
        """
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        documents = self.store.list_documents(txn_id)
        conditions = self.store.list_conditions(txn_id)
        parties = {p.id: p for p in self.store.list_parties(txn_id)}
        
        # Group documents by type
        doc_by_type = {}
        for doc in documents:
            doc_type = doc.document_type.value if hasattr(doc.document_type, 'value') else str(doc.document_type)
            if doc_type not in doc_by_type:
                doc_by_type[doc_type] = []
            doc_by_type[doc_type].append(doc)
        
        # Build checklist
        checklist = []
        item_num = 1
        
        # Section 1: Credit Agreement
        checklist.append({
            "section": "1",
            "title": "CREDIT AGREEMENT AND RELATED DOCUMENTS",
            "items": []
        })
        
        for doc in doc_by_type.get("credit_agreement", []):
            checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
            item_num += 1
        
        for doc in doc_by_type.get("amendment", []):
            checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
            item_num += 1
        
        # Section 2: Corporate Documents
        checklist.append({
            "section": "2",
            "title": "CORPORATE DOCUMENTS",
            "items": []
        })
        
        corp_types = ["officers_certificate", "secretary_certificate", "good_standing", 
                      "charter_documents", "bylaws", "resolutions", "incumbency_certificate"]
        for doc_type in corp_types:
            for doc in doc_by_type.get(doc_type, []):
                checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
                item_num += 1
        
        # Section 3: Security Documents
        checklist.append({
            "section": "3",
            "title": "SECURITY DOCUMENTS",
            "items": []
        })
        
        security_types = ["security_agreement", "pledge_agreement", "guaranty", 
                         "perfection_certificate", "ucc_financing_statement", "ip_security_agreement"]
        for doc_type in security_types:
            for doc in doc_by_type.get(doc_type, []):
                checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
                item_num += 1
        
        # Section 4: Legal Opinions
        checklist.append({
            "section": "4",
            "title": "LEGAL OPINIONS",
            "items": []
        })
        
        for doc in doc_by_type.get("legal_opinion", []):
            checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
            item_num += 1
        
        # Section 5: Certificates and Other Documents
        checklist.append({
            "section": "5",
            "title": "CERTIFICATES AND OTHER DOCUMENTS",
            "items": []
        })
        
        other_types = ["solvency_certificate", "closing_certificate", "compliance_certificate",
                       "financial_statements", "fee_letter", "side_letter"]
        for doc_type in other_types:
            for doc in doc_by_type.get(doc_type, []):
                checklist[-1]["items"].append(self._format_checklist_item(item_num, doc, parties))
                item_num += 1
        
        return checklist
    
    def _format_checklist_item(self, num: int, doc: Document, parties: dict) -> dict:
        """Format a document as a checklist item."""
        responsible = ""
        if doc.responsible_party_id and doc.responsible_party_id in parties:
            responsible = parties[doc.responsible_party_id].short_name
        
        status_display = doc.status.value if hasattr(doc.status, 'value') else str(doc.status)
        
        return {
            "number": num,
            "document_id": doc.id,
            "title": doc.title,
            "status": status_display,
            "responsible_party": responsible,
            "due_date": doc.due_date.isoformat() if doc.due_date else "",
            "notes": doc.notes,
        }
    
    # =========================================================================
    # STATUS REPORTING
    # =========================================================================
    
    def get_status_summary(self, txn_id: str) -> dict:
        """Get a comprehensive status summary for a transaction."""
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        documents = self.store.list_documents(txn_id)
        conditions = self.store.list_conditions(txn_id)
        
        # Document statistics
        doc_stats = {"total": len(documents)}
        for status in DocumentStatus:
            count = sum(1 for d in documents if d.status == status)
            if count > 0:
                doc_stats[status.value] = count
        
        # Condition statistics
        cond_stats = {"total": len(conditions)}
        for status in ConditionStatus:
            count = sum(1 for c in conditions if c.status == status)
            if count > 0:
                cond_stats[status.value] = count
        
        # Compute readiness
        docs_ready = sum(1 for d in documents if d.status in 
                        [DocumentStatus.FINAL, DocumentStatus.EXECUTED])
        conds_ready = sum(1 for c in conditions if c.status in 
                         [ConditionStatus.SATISFIED, ConditionStatus.WAIVED, ConditionStatus.NOT_APPLICABLE])
        
        total_items = len(documents) + len(conditions)
        ready_items = docs_ready + conds_ready
        readiness_pct = (ready_items / total_items * 100) if total_items > 0 else 0
        
        # Outstanding items
        outstanding_docs = [d for d in documents if d.status not in 
                          [DocumentStatus.FINAL, DocumentStatus.EXECUTED]]
        outstanding_conds = [c for c in conditions if c.status not in 
                           [ConditionStatus.SATISFIED, ConditionStatus.WAIVED, ConditionStatus.NOT_APPLICABLE]]
        
        return {
            "transaction": {
                "id": txn.id,
                "name": txn.name,
                "facility_amount": txn.facility_amount,
                "closing_date": txn.closing_date.isoformat() if txn.closing_date else None,
                "is_closed": txn.is_closed,
            },
            "documents": doc_stats,
            "conditions": cond_stats,
            "readiness": {
                "percentage": round(readiness_pct, 1),
                "ready_items": ready_items,
                "total_items": total_items,
            },
            "outstanding": {
                "documents": [{"id": d.id, "title": d.title, "status": d.status.value} 
                             for d in outstanding_docs],
                "conditions": [{"id": c.id, "title": c.title, "status": c.status.value}
                              for c in outstanding_conds],
            }
        }
    
    def get_party_responsibility_report(self, txn_id: str) -> dict:
        """Get a report of documents by responsible party."""
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        documents = self.store.list_documents(txn_id)
        parties = {p.id: p for p in self.store.list_parties(txn_id)}
        
        by_party = {}
        unassigned = []
        
        for doc in documents:
            if doc.responsible_party_id and doc.responsible_party_id in parties:
                party_name = parties[doc.responsible_party_id].short_name
                if party_name not in by_party:
                    by_party[party_name] = []
                by_party[party_name].append({
                    "id": doc.id,
                    "title": doc.title,
                    "status": doc.status.value,
                    "due_date": doc.due_date.isoformat() if doc.due_date else None,
                })
            else:
                unassigned.append({
                    "id": doc.id,
                    "title": doc.title,
                    "status": doc.status.value,
                })
        
        return {
            "by_party": by_party,
            "unassigned": unassigned,
        }
    
    # =========================================================================
    # VERSION CONTROL & AUDIT (Gwern-inspired features)
    # =========================================================================
    
    def get_audit_trail(self, entity_type: str = None, entity_id: str = None, limit: int = 50) -> list[dict]:
        """Get audit trail entries."""
        if not self.versioning_enabled or not self.audit_log:
            return []
        
        entries = self.audit_log.get_entries(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit
        )
        
        return [
            {
                "timestamp": e.timestamp,
                "action": e.action,
                "entity_type": e.entity_type,
                "entity_id": e.entity_id[:8] if e.entity_id else "",
                "changes": e.changes,
                "checksum": e.checksum[:8] if e.checksum else "",
            }
            for e in entries
        ]
    
    def get_entity_history(self, entity_type: str, entity_id: str) -> list[dict]:
        """Get complete history for a specific entity."""
        if not self.versioning_enabled or not self.audit_log:
            return []
        
        return self.audit_log.get_entity_timeline(entity_type, entity_id)
    
    def get_git_history(self, limit: int = 20) -> list[dict]:
        """Get git commit history."""
        if not self.versioning_enabled or not self.version_control:
            return []
        
        return self.version_control.get_history(limit)
    
    def create_closing_snapshot(self, txn_id: str) -> dict:
        """
        Create an immutable snapshot for a closing.
        
        This creates a point-in-time record of the entire transaction state
        that can be used for compliance, audit, or rollback purposes.
        """
        if not self.versioning_enabled or not self.snapshot_manager:
            return {"error": "Versioning not enabled"}
        
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        # Create snapshot with transaction name
        safe_name = txn.name.replace(" ", "_").replace("$", "").replace("/", "-")[:30]
        snapshot_name = f"closing_{safe_name}"
        
        manifest = self.snapshot_manager.create_snapshot(
            name=snapshot_name,
            description=f"Closing snapshot for {txn.name}"
        )
        
        # Log the snapshot creation
        self._log_action("SNAPSHOT", "transaction", txn_id, {
            "snapshot_id": manifest["id"],
            "snapshot_name": snapshot_name,
        })
        
        return manifest
    
    def list_snapshots(self) -> list[dict]:
        """List all snapshots."""
        if not self.versioning_enabled or not self.snapshot_manager:
            return []
        
        return self.snapshot_manager.list_snapshots()
    
    def verify_audit_integrity(self) -> dict:
        """Verify the integrity of the audit log."""
        if not self.versioning_enabled or not self.audit_log:
            return {"status": "disabled", "message": "Versioning not enabled"}
        
        is_valid, errors = self.audit_log.verify_integrity()
        
        return {
            "status": "valid" if is_valid else "corrupted",
            "errors": errors,
            "message": "Audit log integrity verified" if is_valid else f"Found {len(errors)} integrity issues"
        }
    
    def archive_generated_document(self, filepath: str, doc_type: str, txn_id: str) -> dict:
        """Archive a generated document."""
        if not self.versioning_enabled or not self.document_archive:
            return {"error": "Versioning not enabled"}
        
        txn = self.store.get_transaction(txn_id)
        metadata = {
            "transaction_name": txn.name if txn else "Unknown",
            "generated_at": datetime.now().isoformat(),
        }
        
        entry = self.document_archive.archive_document(
            source_path=filepath,
            doc_type=doc_type,
            transaction_id=txn_id,
            metadata=metadata
        )
        
        # Log the archival
        self._log_action("ARCHIVE", "document", entry["content_hash"][:16], {
            "doc_type": doc_type,
            "transaction_id": txn_id,
            "original_name": entry["original_name"],
        })
        
        return entry
    
    # =========================================================================
    # DEFINED TERMS MANAGEMENT
    # =========================================================================
    
    def parse_definitions(self, text: str, source: str = "credit_agreement") -> list:
        """
        Parse defined terms from document text.
        
        Args:
            text: The document text (typically Article I definitions)
            source: Source document type
        
        Returns:
            List of parsed DefinedTerm objects
        """
        if not self.terms_enabled:
            return []
        
        # Convert source string to enum
        try:
            source_enum = TermSource(source)
        except ValueError:
            source_enum = TermSource.OTHER
        
        terms = self.terms_parser.parse_definitions(text, source_enum)
        
        # Save to store
        self.terms_store.save_terms(terms)
        
        # Log the parsing
        self._log_action("PARSE", "defined_terms", source, {
            "terms_count": len(terms),
            "source": source,
        })
        
        return terms
    
    def load_sample_definitions(self) -> list:
        """Load the sample credit agreement definitions."""
        if not self.terms_enabled:
            return []
        
        return self.parse_definitions(SAMPLE_DEFINITIONS, "credit_agreement")
    
    def list_defined_terms(self, category: str = None) -> list[dict]:
        """
        List all defined terms, optionally filtered by category.
        
        Args:
            category: Optional category filter (party, financial, date, etc.)
        
        Returns:
            List of term dictionaries
        """
        if not self.terms_enabled:
            return []
        
        cat_enum = None
        if category:
            try:
                cat_enum = TermCategory(category)
            except ValueError:
                pass
        
        terms = self.terms_store.list_terms(cat_enum)
        
        return [
            {
                "id": t.id,
                "term": t.term,
                "definition": t.definition[:200] + "..." if len(t.definition) > 200 else t.definition,
                "category": t.category.value,
                "source": t.source.value,
                "cross_references": t.cross_references[:5],  # Limit for display
            }
            for t in terms
        ]
    
    def get_term_detail(self, term_name: str) -> dict:
        """Get detailed information about a defined term."""
        if not self.terms_enabled:
            return {}
        
        term = self.terms_store.get_term(term_name)
        if not term:
            return {}
        
        usages = self.terms_store.get_term_usages(term_name)
        
        return {
            "id": term.id,
            "term": term.term,
            "definition": term.definition,
            "category": term.category.value,
            "source": term.source.value,
            "section_reference": term.section_reference,
            "cross_references": term.cross_references,
            "usage_count": len([u for u in usages if not u.is_definition]),
            "usages": [
                {
                    "document_type": u.document_type,
                    "section": u.section,
                    "context": u.context,
                }
                for u in usages[:10]  # Limit for display
            ],
        }
    
    def scan_document_for_terms(self, text: str, document_id: str, document_type: str) -> dict:
        """
        Scan a document for defined term usages.
        
        Args:
            text: Document text to scan
            document_id: ID of the document
            document_type: Type of document
        
        Returns:
            Summary of terms found
        """
        if not self.terms_enabled:
            return {}
        
        known_terms = [t.term for t in self.terms_store.list_terms()]
        usages = self.terms_parser.find_term_usages(
            text, document_id, document_type, known_terms
        )
        
        # Save usages
        self.terms_store.save_usages(usages)
        
        # Find potentially undefined terms
        undefined = self.terms_analyzer.find_undefined_terms(text)
        
        # Group usages by term
        by_term = {}
        for u in usages:
            if u.term not in by_term:
                by_term[u.term] = 0
            by_term[u.term] += 1
        
        return {
            "document_id": document_id,
            "document_type": document_type,
            "terms_found": len(by_term),
            "total_usages": len(usages),
            "term_counts": dict(sorted(by_term.items(), key=lambda x: x[1], reverse=True)[:20]),
            "potentially_undefined": undefined[:20],
        }
    
    def get_terms_report(self) -> dict:
        """Generate a comprehensive report on defined terms."""
        if not self.terms_enabled:
            return {"error": "Terms system not enabled"}
        
        return self.terms_analyzer.generate_term_report()
    
    def find_orphaned_terms(self) -> list[dict]:
        """Find terms that are defined but never used."""
        if not self.terms_enabled:
            return []
        
        orphaned = self.terms_analyzer.find_orphaned_terms()
        return [{"term": t.term, "category": t.category.value} for t in orphaned]
    
    def check_term_consistency(self) -> list[dict]:
        """Check for inconsistencies in term definitions and usage."""
        if not self.terms_enabled:
            return []
        
        return self.terms_analyzer.check_consistency()
    
    def get_term_graph(self) -> dict:
        """
        Get a graph of term relationships (for visualization).
        
        Returns nodes (terms) and edges (typed cross-references).
        Uses the atomized term edges system when available.
        """
        if not self.terms_enabled:
            return {"nodes": [], "edges": []}
        
        terms = self.terms_store.list_terms()
        term_names = {t.term for t in terms}
        
        nodes = [
            {
                "id": t.term,
                "category": t.category.value,
                "definition_length": len(t.definition),
            }
            for t in terms
        ]
        
        # Use typed edges if available, otherwise fall back to old method
        if self.term_edges_enabled and self.term_edge_store:
            typed_edges = self.term_edge_store.get_all()
            edges = [
                {
                    "source": e.source_term,
                    "target": e.target_term,
                    "type": e.edge_type.value,
                    "confidence": e.confidence,
                }
                for e in typed_edges
            ]
        else:
            # Fallback: derive edges from cross_references
            edges = []
            for t in terms:
                for ref in t.cross_references:
                    if ref in term_names:  # Only include edges to known terms
                        edges.append({
                            "source": t.term,
                            "target": ref,
                            "type": "references",
                            "confidence": 0.5,  # Lower confidence for untyped
                        })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
            }
        }
    
    def rebuild_term_edges(self) -> dict:
        """
        Rebuild all term edges from definitions.
        
        This re-extracts typed edges from all term definitions,
        replacing any existing edges.
        
        Returns:
            Summary of edges created
        """
        if not self.term_edges_enabled:
            return {"error": "Term edges system not available"}
        
        # Get all terms with full definitions
        terms = self.terms_store.list_terms()
        terms_data = [
            {
                "term": t.term,
                "definition": t.definition,
                "category": t.category.value,
            }
            for t in terms
        ]
        
        # Rebuild edges
        edge_count = rebuild_edges_from_terms(
            terms_data,
            str(self.data_dir / "terms")
        )
        
        # Get stats
        stats = self.term_graph_analyzer.get_graph_stats() if self.term_graph_analyzer else {}
        
        self._log_action("REBUILD_EDGES", "terms", "all", {
            "edge_count": edge_count,
        })
        
        return {
            "edges_created": edge_count,
            "stats": stats,
        }
    
    def get_term_graph_stats(self) -> dict:
        """Get detailed statistics about the term relationship graph."""
        if not self.term_edges_enabled or not self.term_graph_analyzer:
            return {}
        
        return self.term_graph_analyzer.get_graph_stats()
    
    def get_term_dependencies(self, term_name: str) -> dict:
        """Get the dependency tree for a specific term."""
        if not self.term_edges_enabled or not self.term_graph_analyzer:
            return {}
        
        return self.term_graph_analyzer.get_dependency_chain(term_name)
    
    def find_circular_term_refs(self) -> list:
        """Find any circular references in term definitions."""
        if not self.term_edges_enabled or not self.term_graph_analyzer:
            return []
        
        return self.term_graph_analyzer.find_circular_references()
    
    # =========================================================================
    # FILE WATCHER & SMART CHECKLIST
    # =========================================================================
    
    def create_transaction_folder(self, txn_id: str) -> dict:
        """
        Create a folder structure for a transaction's documents.
        
        Args:
            txn_id: Transaction ID
        
        Returns:
            Dict with folder path and subfolders created
        """
        if not self.filewatcher_enabled:
            return {"error": "File watcher not available"}
        
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        folder_path = self.folder_manager.create_transaction_folder(txn.name)
        
        self._log_action("CREATE_FOLDER", "transaction", txn_id, {
            "folder": str(folder_path),
        })
        
        return {
            "path": str(folder_path),
            "name": folder_path.name,
            "subfolders": self.folder_manager.STANDARD_SUBFOLDERS,
        }
    
    def scan_transaction_folder(self, txn_id: str, subfolder: str = "") -> dict:
        """
        Scan a transaction's folder and generate a smart checklist.
        
        Args:
            txn_id: Transaction ID
            subfolder: Optional specific subfolder to scan
        
        Returns:
            ChecklistSummary as dict
        """
        if not self.filewatcher_enabled:
            return {"error": "File watcher not available"}
        
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        # Generate expected folder name
        import re
        safe_name = re.sub(r'[^\w\s-]', '', txn.name)
        safe_name = re.sub(r'\s+', '_', safe_name)[:50]
        
        scan_path = subfolder or safe_name
        
        try:
            summary = self.smart_checklist.generate_checklist(txn_id, scan_path)
            return {
                "transaction_id": summary.transaction_id,
                "transaction_name": summary.transaction_name,
                "scan_folder": summary.scan_folder,
                "scan_time": summary.scan_time,
                "total_expected": summary.total_expected,
                "total_found": summary.total_found,
                "total_missing": summary.total_missing,
                "total_unexpected": summary.total_unexpected,
                "ready_percentage": round(summary.ready_percentage, 1),
                "items": summary.items,
                "unexpected_files": summary.unexpected_files,
            }
        except Exception as e:
            return {
                "error": str(e),
                "scan_folder": str(self.docs_folder / scan_path),
            }
    
    def sync_from_folder(self, txn_id: str, subfolder: str = "") -> list[dict]:
        """
        Update document statuses based on file presence in folder.
        
        Returns list of documents that were updated.
        """
        if not self.filewatcher_enabled:
            return []
        
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        import re
        safe_name = re.sub(r'[^\w\s-]', '', txn.name)
        safe_name = re.sub(r'\s+', '_', safe_name)[:50]
        
        scan_path = subfolder or safe_name
        
        updated = self.smart_checklist.sync_status_from_files(txn_id, scan_path)
        
        for doc in updated:
            self._log_action("SYNC_FROM_FILE", "document", doc['document_id'], {
                "old_status": doc['old_status'],
                "new_status": doc['new_status'],
            })
        
        return updated
    
    def get_smart_checklist_report(self, txn_id: str, subfolder: str = "") -> str:
        """Generate a text report of the smart checklist."""
        if not self.filewatcher_enabled:
            return "File watcher not available"
        
        txn = self.store.get_transaction(txn_id)
        if not txn:
            raise ValueError(f"Transaction {txn_id} not found")
        
        import re
        safe_name = re.sub(r'[^\w\s-]', '', txn.name)
        safe_name = re.sub(r'\s+', '_', safe_name)[:50]
        
        scan_path = subfolder or safe_name
        
        try:
            summary = self.smart_checklist.generate_checklist(txn_id, scan_path)
            return self.smart_checklist.generate_checklist_report(summary)
        except Exception as e:
            return f"Error: {e}"
    
    def get_folder_suggestions(self, txn_id: str) -> list[dict]:
        """
        Get suggestions for where documents should be placed.
        
        Returns list of documents with suggested folders.
        """
        if not self.filewatcher_enabled:
            return []
        
        documents = self.store.list_documents(txn_id)
        
        suggestions = []
        for doc in documents:
            suggested_folder = self.folder_manager.suggest_folder_for_document(
                doc.document_type.value
            )
            suggestions.append({
                "document_id": doc.id,
                "title": doc.title,
                "document_type": doc.document_type.value,
                "suggested_folder": suggested_folder,
            })
        
        return suggestions

