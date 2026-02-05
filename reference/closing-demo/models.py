"""
Legal Transaction Engine - Core Data Models

This module defines the fundamental entities for tracking credit agreement
closings: transactions, documents, parties, and conditions precedent.

Design Philosophy:
- Credit agreements are structured data, not just documents
- Every change is versioned and auditable
- Cross-references are first-class citizens
- Temporal relationships (effective dates, waivers) are explicit
"""

from dataclasses import dataclass, field
from datetime import datetime, date
from enum import Enum
from typing import Optional
import uuid


# =============================================================================
# ENUMERATIONS
# =============================================================================

class TransactionType(Enum):
    """Types of credit facilities"""
    REVOLVING_CREDIT = "revolving_credit"
    TERM_LOAN_A = "term_loan_a"
    TERM_LOAN_B = "term_loan_b"
    DELAYED_DRAW = "delayed_draw"
    BRIDGE_LOAN = "bridge_loan"
    ABL = "asset_based_loan"
    MULTI_TRANCHE = "multi_tranche"


class DocumentType(Enum):
    """Types of closing deliverables"""
    # Core Agreement Documents
    CREDIT_AGREEMENT = "credit_agreement"
    AMENDMENT = "amendment"
    WAIVER = "waiver"
    CONSENT = "consent"
    JOINDER = "joinder"
    
    # Corporate Documents
    OFFICERS_CERTIFICATE = "officers_certificate"
    SECRETARY_CERTIFICATE = "secretary_certificate"
    INCUMBENCY_CERTIFICATE = "incumbency_certificate"
    GOOD_STANDING = "good_standing"
    CHARTER_DOCUMENTS = "charter_documents"
    BYLAWS = "bylaws"
    RESOLUTIONS = "resolutions"
    
    # Security Documents
    PLEDGE_AGREEMENT = "pledge_agreement"
    SECURITY_AGREEMENT = "security_agreement"
    GUARANTY = "guaranty"
    PERFECTION_CERTIFICATE = "perfection_certificate"
    UCC_FINANCING_STATEMENT = "ucc_financing_statement"
    IP_SECURITY_AGREEMENT = "ip_security_agreement"
    
    # Opinions and Certificates
    LEGAL_OPINION = "legal_opinion"
    SOLVENCY_CERTIFICATE = "solvency_certificate"
    COMPLIANCE_CERTIFICATE = "compliance_certificate"
    BORROWING_BASE_CERTIFICATE = "borrowing_base_certificate"
    
    # Financial Documents
    FINANCIAL_STATEMENTS = "financial_statements"
    PRO_FORMA = "pro_forma"
    
    # Notices and Requests
    BORROWING_REQUEST = "borrowing_request"
    NOTICE_OF_BORROWING = "notice_of_borrowing"
    CLOSING_CERTIFICATE = "closing_certificate"
    
    # Other
    FEE_LETTER = "fee_letter"
    SIDE_LETTER = "side_letter"
    EXHIBIT = "exhibit"
    SCHEDULE = "schedule"
    OTHER = "other"


class DocumentStatus(Enum):
    """Lifecycle status of a document"""
    NOT_STARTED = "not_started"
    DRAFTING = "drafting"
    INTERNAL_REVIEW = "internal_review"
    OUT_FOR_REVIEW = "out_for_review"
    COMMENTS_RECEIVED = "comments_received"
    FINAL = "final"
    EXECUTED = "executed"
    FILED = "filed"  # For UCC filings, etc.
    SUPERSEDED = "superseded"


class PartyRole(Enum):
    """Roles parties play in a transaction"""
    BORROWER = "borrower"
    CO_BORROWER = "co_borrower"
    GUARANTOR = "guarantor"
    ADMINISTRATIVE_AGENT = "administrative_agent"
    COLLATERAL_AGENT = "collateral_agent"
    LENDER = "lender"
    LEAD_ARRANGER = "lead_arranger"
    SYNDICATION_AGENT = "syndication_agent"
    DOCUMENTATION_AGENT = "documentation_agent"
    ISSUING_BANK = "issuing_bank"
    SWINGLINE_LENDER = "swingline_lender"


class ConditionStatus(Enum):
    """Status of a condition precedent"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SATISFIED = "satisfied"
    WAIVED = "waived"
    NOT_APPLICABLE = "not_applicable"


# =============================================================================
# CORE ENTITIES
# =============================================================================

@dataclass
class Party:
    """
    An entity involved in the transaction.
    
    Tracks both the organizational details and their role in the deal.
    A single entity might have multiple roles (e.g., Borrower and Guarantor).
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    short_name: str = ""  # "XYZ Corp" vs "XYZ Corporation, a Delaware corporation"
    jurisdiction: str = ""  # "Delaware", "New York"
    entity_type: str = ""  # "corporation", "LLC", "LP"
    
    # Roles in this transaction
    roles: list[PartyRole] = field(default_factory=list)
    
    # Contact/Notice Information
    address: str = ""
    attention: str = ""
    email: str = ""
    
    # Signature Block Template
    signature_block: str = ""
    
    # Organizational Documents
    formation_date: Optional[date] = None
    state_id: str = ""  # State registration number
    ein: str = ""  # For US entities
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    notes: str = ""


@dataclass
class Document:
    """
    A deliverable in the closing set.
    
    Each document has:
    - Type and status tracking
    - Responsibility assignment
    - Version history
    - Cross-references to related documents
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    document_type: DocumentType = DocumentType.OTHER
    title: str = ""
    description: str = ""
    
    # Status Tracking
    status: DocumentStatus = DocumentStatus.NOT_STARTED
    
    # Responsibility
    responsible_party_id: Optional[str] = None  # Who prepares this
    reviewing_parties: list[str] = field(default_factory=list)  # Who reviews
    
    # Timing
    due_date: Optional[date] = None
    received_date: Optional[date] = None
    execution_date: Optional[date] = None
    
    # Related Documents
    parent_document_id: Optional[str] = None  # For exhibits/schedules
    related_document_ids: list[str] = field(default_factory=list)
    
    # Conditions this satisfies
    satisfies_condition_ids: list[str] = field(default_factory=list)
    
    # File Information
    current_version: int = 1
    file_path: Optional[str] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    notes: str = ""


@dataclass
class ConditionPrecedent:
    """
    A condition that must be satisfied before closing.
    
    Conditions map directly to Credit Agreement Article IV requirements.
    Each condition tracks:
    - What needs to be delivered/satisfied
    - Who is responsible
    - What documents satisfy it
    - Current status
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Reference to Credit Agreement
    section_reference: str = ""  # "4.01(a)(iii)"
    
    # Description
    title: str = ""
    description: str = ""  # Full text from Credit Agreement
    
    # Categorization
    category: str = ""  # "Corporate Documents", "Legal Opinions", etc.
    
    # Status
    status: ConditionStatus = ConditionStatus.PENDING
    
    # Responsibility
    responsible_party_id: Optional[str] = None
    
    # Documents that satisfy this condition
    satisfied_by_document_ids: list[str] = field(default_factory=list)
    
    # Waiver tracking
    waived_date: Optional[date] = None
    waiver_document_id: Optional[str] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    notes: str = ""


@dataclass 
class Transaction:
    """
    The credit facility itself.
    
    This is the root entity that contains:
    - Deal terms (facility amount, type, dates)
    - All parties
    - All documents
    - All conditions precedent
    - Version/amendment history
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Basic Deal Information
    name: str = ""  # "XYZ Corp Credit Facility"
    transaction_type: TransactionType = TransactionType.REVOLVING_CREDIT
    
    # Facility Terms
    facility_amount: float = 0.0
    currency: str = "USD"
    
    # Key Dates
    signing_date: Optional[date] = None
    closing_date: Optional[date] = None
    maturity_date: Optional[date] = None
    
    # Parties (by ID reference)
    borrower_id: Optional[str] = None
    agent_id: Optional[str] = None
    party_ids: list[str] = field(default_factory=list)  # All parties
    
    # Documents and Conditions
    document_ids: list[str] = field(default_factory=list)
    condition_ids: list[str] = field(default_factory=list)
    
    # Amendment Tracking
    amendment_number: int = 0  # 0 = original, 1 = Amendment No. 1, etc.
    parent_transaction_id: Optional[str] = None  # Link to prior version
    
    # Status
    is_closed: bool = False
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    notes: str = ""


# =============================================================================
# SUPPORTING ENTITIES
# =============================================================================

@dataclass
class DefinedTerm:
    """
    A defined term from the Credit Agreement.
    
    Tracks the definition and all places it's used,
    enabling automatic updates when definitions change.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    term: str = ""  # "Borrower"
    definition: str = ""  # Full definition text
    section_reference: str = ""  # "Section 1.01"
    
    # Version tracking
    version: int = 1
    effective_date: Optional[date] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CrossReference:
    """
    A cross-reference between sections or documents.
    
    Enables validation that cross-references remain valid
    after amendments or section renumbering.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    from_document_id: str = ""
    from_location: str = ""  # "Section 3.14(b)"
    
    to_document_id: str = ""
    to_location: str = ""  # "Section 4.01(a)(iii)"
    
    reference_text: str = ""  # "as set forth in Section 4.01(a)(iii)"
    
    is_valid: bool = True
    validation_date: Optional[datetime] = None
    
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class SignaturePage:
    """
    Tracks signature status for a document.
    
    Each party that needs to sign a document gets a SignaturePage entry.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    document_id: str = ""
    party_id: str = ""
    
    signature_block: str = ""  # Rendered signature block
    
    # Status
    is_signed: bool = False
    signed_date: Optional[datetime] = None
    signed_by: str = ""  # Name of signatory
    signed_title: str = ""  # Title of signatory
    
    # For counterpart tracking
    counterpart_number: Optional[int] = None
    
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ChecklistItem:
    """
    A line item in the closing checklist.
    
    This is a display/organizational wrapper that groups
    documents and conditions for checklist presentation.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Checklist Organization
    item_number: str = ""  # "1.1", "2.3.a"
    category: str = ""  # "Corporate Documents", "Security Documents"
    
    # Reference
    document_id: Optional[str] = None
    condition_id: Optional[str] = None
    
    # Display
    description: str = ""
    
    # Responsibility
    responsible_party_id: Optional[str] = None
    
    # Custom fields for display
    custom_fields: dict = field(default_factory=dict)
    
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
