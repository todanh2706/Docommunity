package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String email;

    private Boolean status;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ManyToMany(mappedBy = "likedByUsers")
    private Set<DocumentEntity> likedDocuments = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CommentEntity> comments = new HashSet<>();

    @ManyToMany(mappedBy = "markedByUsers")
    private Set<DocumentEntity> markedDocuments = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserEntity that = (UserEntity) o;
        // nếu id null (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // pattern an toàn cho entity JPA
        return getClass().hashCode();
    }

}