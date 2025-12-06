package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "report_user_reasons")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportUserReasonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                                // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        ReportUserReasonEntity that = (ReportUserReasonEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA
        return getClass().hashCode();
    }
}