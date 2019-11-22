package s.c.h.i.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/quotation")
public class QuotationController {

	@RequestMapping("/index")
	public String index() {
		return "quotationPage1";
	}

	@RequestMapping(value = "/step/{pageNo}", method = RequestMethod.POST)
	public String goTo(@PathVariable("pageNo") int pageNo) {
		return "quotationPage" + pageNo;
	}

}
