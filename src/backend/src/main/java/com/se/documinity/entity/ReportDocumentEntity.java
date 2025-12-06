package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "report_documents")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportDocumentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private UserEntity reporter;

    // NOTE: Your SQL Foreign Key points to 'document_comments'.
    // If you meant to report a Document, change this to type 'Document'.
    @ManyToOne
    @JoinColumn(name = "target_id")
    private DocumentCommentEntity target;

    @ManyToOne
    @JoinColumn(name = "reason_id")
    private ReportDocumentReasonEntity reason;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                         // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        ReportDocumentEntity that = (ReportDocumentEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA (tránh dùng field mutable)
        return getClass().hashCode();
    }
}