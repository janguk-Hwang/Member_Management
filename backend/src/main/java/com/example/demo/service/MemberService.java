package com.example.demo.service;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.SignupRequest;
import com.example.demo.entity.Member;
import com.example.demo.entity.Role;
import com.example.demo.repository.MemberRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public Member signup(SignupRequest request) {
        if (request.getPassword() == null || request.getPassword().length() < 8 || request.getPassword().length() > 15) {
            throw new RuntimeException("비밀번호는 8자 이상 15자 이하로 입력해야 합니다.");
        }
        
        if (memberRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Name already exists");
        }

        Role role = Role.USER;
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            role = Role.ADMIN;
        }

        Member member = new Member(
                request.getName(),
                passwordEncoder.encode(request.getPassword()),
                request.getAddress(),
                request.getBirthDate(),
                request.getPhone(),
                role
        );
        return memberRepository.save(member);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Member member = memberRepository.findByName(request.getName())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtTokenProvider.createToken(member.getName(), member.getRole().name());
        member.setActiveToken(token); // 동시 로그인 방지: 새 토큰 발급 시 기존 토큰 무효화
        memberRepository.save(member);

        return new AuthResponse(token, member.getName(), member.getRole().name());
    }

    @Transactional
    public void logout(String username) {
        memberRepository.findByName(username).ifPresent(member -> {
            member.setActiveToken(null);
            memberRepository.save(member);
        });
    }

    public boolean isNameAvailable(String name) {
        return memberRepository.findByName(name).isEmpty();
    }

    @Transactional
    public Member updateProfile(String username, String address, String phone, String birthDateStr) {
        Member member = memberRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        member.setAddress(address);
        member.setPhone(phone);
        if (birthDateStr != null && !birthDateStr.isEmpty()) {
            member.setBirthDate(java.time.LocalDate.parse(birthDateStr));
        }
        return memberRepository.save(member);
    }

    public Page<Member> getAllMembers(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    public Page<Member> searchMembersByName(String name, Pageable pageable) {
        return memberRepository.findByNameContaining(name, pageable);
    }

    public Optional<Member> getMemberByName(String name) {
        return memberRepository.findByName(name);
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    @Transactional
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
}
