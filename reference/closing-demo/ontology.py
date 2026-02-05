from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
import json

from models import DocumentType


BASE_DIR = Path(__file__).resolve().parent


@dataclass
class DocumentTemplate:
    key: str
    document_type: DocumentType
    default_title: str
    category: Optional[str] = None
    default_responsible_role: Optional[str] = None
    # Name of the Transaction field to use for due date (e.g. "closing_date")
    default_due_date_field: Optional[str] = "closing_date"


@dataclass
class ConditionTemplate:
    section_reference: str
    title: str
    description: str
    category: str
    expected_document_keys: List[str] = field(default_factory=list)


@dataclass
class CreditAgreementOntology:
    name: str
    document_templates: Dict[str, DocumentTemplate]
    condition_templates: List[ConditionTemplate]

    @classmethod
    def load(cls, name: str = "credit_agreement_v1") -> "CreditAgreementOntology":
        """
        Load ontology configuration from ontology/<name>.json.

        JSON structure:

        {
          "name": "...",
          "document_templates": [...],
          "condition_templates": [...]
        }
        """
        config_path = BASE_DIR / "ontology" / f"{name}.json"
        if not config_path.exists():
            raise FileNotFoundError(f"Ontology config not found: {config_path}")

        with config_path.open("r", encoding="utf-8") as f:
            raw = json.load(f)

        doc_templates: Dict[str, DocumentTemplate] = {}
        for item in raw.get("document_templates", []):
            key = item["key"]
            dt_value = item["document_type"]

            try:
                # DocumentType Enum is value-based, so this works for "credit_agreement", etc.
                doc_type = DocumentType(dt_value)
            except ValueError as exc:
                raise ValueError(
                    f"Unknown DocumentType value '{dt_value}' in ontology "
                    f"{config_path}"
                ) from exc

            doc_templates[key] = DocumentTemplate(
                key=key,
                document_type=doc_type,
                default_title=item["default_title"],
                category=item.get("category"),
                default_responsible_role=item.get("default_responsible_role"),
                default_due_date_field=item.get("default_due_date_field", "closing_date"),
            )

        cond_templates: List[ConditionTemplate] = []
        for item in raw.get("condition_templates", []):
            cond_templates.append(
                ConditionTemplate(
                    section_reference=item["section_reference"],
                    title=item["title"],
                    description=item["description"],
                    category=item.get("category", item["title"]),
                    expected_document_keys=item.get("expected_document_keys", []),
                )
            )

        return cls(
            name=raw.get("name", name),
            document_templates=doc_templates,
            condition_templates=cond_templates,
        )
