package com.example.demo.controller;

import com.example.demo.entity.Member;
import com.example.demo.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<?> getMembers(
            @RequestParam(required = false) String name,
            Pageable pageable,
            Authentication authentication) {
            
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        if (isAdmin) {
            if (name != null && !name.isEmpty()) {
                return ResponseEntity.ok(memberService.searchMembersByName(name, pageable));
            }
            return ResponseEntity.ok(memberService.getAllMembers(pageable));
        } else {
            // 일반 사용자는 본인 정보만 확인 가능
            String currentUsername = authentication.getName();
            return memberService.getMemberByName(currentUsername)
                    .map(member -> ResponseEntity.ok(Collections.singletonList(member)))
                    .orElse(ResponseEntity.notFound().build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
