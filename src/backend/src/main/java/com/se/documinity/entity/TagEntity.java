package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tags")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TagEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags")
    private Set<DocumentEntity> documents = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                                // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        TagEntity that = (TagEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA
        return getClass().hashCode();
    }
}