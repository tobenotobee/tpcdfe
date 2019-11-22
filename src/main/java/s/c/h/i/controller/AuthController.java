package s.c.h.i.controller;

import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import net.minidev.json.JSONArray;

@Controller
public class AuthController {
	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@SuppressWarnings("unchecked")
	@GetMapping("/")
	public String authCallBack(Model model) {
		Authentication token = SecurityContextHolder.getContext().getAuthentication();
		String rtnUrl = "/login";
		Optional<OidcUserAuthority> oidcUserAuthority = (Optional<OidcUserAuthority>) token.getAuthorities().stream()
				.findFirst();
		if (oidcUserAuthority.isPresent()) {
			String username = (String) oidcUserAuthority.get().getIdToken().getClaims().get("cognito:username");
			JSONArray groups = (JSONArray) oidcUserAuthority.get().getIdToken().getClaims().get("cognito:groups");
			String groupname = groups.stream().map(Object::toString).collect(Collectors.joining("; "));
			model.addAttribute("profile", username);
			model.addAttribute("group", groupname);

			log.info("Group==============>" + groupname);
			if ("EndUser".equals(groupname)) {
				rtnUrl = "forward:quotation/index";
			} else if ("Uploader".equals(groupname)) {
				rtnUrl = "forward:usermgr/uploader";
			}
			log.info("RtnUrl==============>" + rtnUrl);
		}
		return rtnUrl;
	}

	// @GetMapping("/logout")
	// public String logOut() {
	// return "home";
	// }

}
