package com.Mybeez.TeamB.TeamB.security;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        System.out.println(">>> Loading user '" + user.getEmail() + "' with role: " + user.getRole());

        if (user.isBanned()) {
            throw new DisabledException("Your account has been banned.");
        }

        if (user.isDeleted()) {
            throw new DisabledException("Your account has been deleted.");
        }

        if (!user.isActive()) {
            throw new DisabledException("Your account is inactive.");
        }

        return user;
    }
}
