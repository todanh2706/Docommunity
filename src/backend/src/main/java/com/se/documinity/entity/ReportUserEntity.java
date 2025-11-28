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
}