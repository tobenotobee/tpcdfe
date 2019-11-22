package s.c.h.i.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import s.c.h.i.consts.Consts;

@Controller

public class LogoutController {

	@GetMapping("/logoutAA")
	public String logout() {
		return "redirect:" + Consts.LOGOUT_URL;
	}

	@RequestMapping("/exit")
	public void exit(HttpServletRequest request, HttpServletResponse response) {
		// token can be revoked here if needed
		new SecurityContextLogoutHandler().logout(request, null, null);
		try {
			// sending back to client app
			response.sendRedirect(request.getHeader("referer"));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
