package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ReactRoutingController {

    // 정적 파일(.js, .css 등)이나 /api/로 시작하는 경로가 아닌 모든 요청을 React의 index.html로 포워딩합니다.
    @RequestMapping(value = {
        "/",
        "/{x:[\\w\\-]+}",
        "/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
