package com.gamemaster.controller;

import com.gamemaster.model.Role;
import com.gamemaster.model.Usuario;
import com.gamemaster.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.salvarOuAtualizar(usuario));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Usuario> alterarRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        return ResponseEntity.ok(usuarioService.alterarRole(id, request.getRole()));
    }

    public static class RoleRequest {
        private Role role;

        public RoleRequest() {}

        public RoleRequest(Role role) {
            this.role = role;
        }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }
}
