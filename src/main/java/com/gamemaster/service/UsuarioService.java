package com.gamemaster.service;

import com.gamemaster.model.Role;
import com.gamemaster.model.Usuario;
import com.gamemaster.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    public static final String SUPER_ADMIN_EMAIL = "lucastassis2@gmail.com";

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario salvarOuAtualizar(Usuario usuario) {
        // Garantia de que o e-mail lucastassis2@gmail.com é sempre ROLE_ADMIN
        if (SUPER_ADMIN_EMAIL.equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRole(Role.ROLE_ADMIN);
        } else if (usuario.getRole() == null) {
            usuario.setRole(Role.ROLE_USER);
        }

        Optional<Usuario> existente = usuarioRepository.findByEmail(usuario.getEmail());
        if (existente.isPresent()) {
            Usuario u = existente.get();
            u.setNome(usuario.getNome());
            u.setFotoUrl(usuario.getFotoUrl());
            if (SUPER_ADMIN_EMAIL.equalsIgnoreCase(u.getEmail())) {
                u.setRole(Role.ROLE_ADMIN);
            }
            return usuarioRepository.save(u);
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario alterarRole(Long usuarioId, Role novaRole) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + usuarioId));

        // Regra de Ouro: lucastassis2@gmail.com sempre permanece ADMIN
        if (SUPER_ADMIN_EMAIL.equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRole(Role.ROLE_ADMIN);
        } else {
            usuario.setRole(novaRole);
        }

        return usuarioRepository.save(usuario);
    }
}
