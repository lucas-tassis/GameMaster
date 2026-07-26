package com.gamemaster.config;

import com.gamemaster.model.Role;
import com.gamemaster.model.Usuario;
import com.gamemaster.repository.UsuarioRepository;
import com.gamemaster.service.UsuarioService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    public DataInitializer(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        // Garantir que o usuário lucastassis2@gmail.com está permanentemente no banco como ADMIN
        if (usuarioRepository.findByEmail(UsuarioService.SUPER_ADMIN_EMAIL).isEmpty()) {
            Usuario superAdmin = new Usuario();
            superAdmin.setNome("Lucas Tassis");
            superAdmin.setEmail(UsuarioService.SUPER_ADMIN_EMAIL);
            superAdmin.setRole(Role.ROLE_ADMIN);
            usuarioRepository.save(superAdmin);
            System.out.println("👑 Administrador Permanente 'lucastassis2@gmail.com' registrado com sucesso!");
        }

        System.out.println("🎲 Inicialização limpa: Acervo aguardando sincronização com a Ludopedia ou cadastro pelo Admin.");
    }
}
