package com.dhrms.dhrms_backend.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email)
                        throws UsernameNotFoundException {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found"));

                return org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPasswordHash())
                                .authorities(
                                                new SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name()))
                                .disabled(
                                                user.getStatus().name().equals("INACTIVE"))
                                .build();
        }
}