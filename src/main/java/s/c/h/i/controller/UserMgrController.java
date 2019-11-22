package s.c.h.i.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/usermgr")
public class UserMgrController {

	@RequestMapping("/uploader")
	public String index() {
		return "uploaderIndex";
	}

}
