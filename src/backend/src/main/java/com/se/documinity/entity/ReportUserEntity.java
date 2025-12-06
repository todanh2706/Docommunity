package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "report_users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportUserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private UserEntity reporter;

    @ManyToOne
    @JoinColumn(name = "target_id")
    private UserEntity target;

    @ManyToOne
    @JoinColumn(name = "reason_id")
    private ReportUserReasonEntity reason;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                         // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        ReportUserEntity that = (ReportUserEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA (tránh dùng field mutable)
        return getClass().hashCode();
    }   
}