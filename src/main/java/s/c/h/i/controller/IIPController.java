package s.c.h.i.controller;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;

import s.c.h.i.consts.IIPConsts;
import s.c.h.i.util.HttpClientResult;
import s.c.h.i.util.HttpClientUtils;

@Controller
@RequestMapping("/iiip")
public class IIPController {

    private static Logger log = LoggerFactory.getLogger(IIPController.class);
    public static Map<String, String> HEADERS = new HashMap<String, String>();
    static {
	HEADERS.put("X-HSBC-Channel-Id", "TPCD");
	HEADERS.put("X-HSBC-Locale", "en_GB");
	HEADERS.put("X-HSBC-Chnl-CountryCode", "SG");
	HEADERS.put("X-HSBC-Chnl-Group-Member", "HBEU");
	HEADERS.put("Content-Type", "application/json");
	HEADERS.put("x-hsbc-saml", "<saml:Assertion xmlns:saml=\"http://www.hsbc.com/saas/assertion\">\r\n"
		+ "<Signature>\r\n" + "<KeyAlias>E2E_TRUST_SAAS_AP01_ALIAS</KeyAlias>\r\n" + "<SignatureValue>\r\n"
		+ "aig3ysRHgmn6iOvDIewCcIPyaq/f7z8OM7wAQODdEpXEKedEcTq34JGQ5NDPoMX9k46mi7GFEp9660uJNfsIR4gOEjBN1IN/FtKbiU4NYqfmEKmon2z6zYMj0eFnviPY4QcOLE4ltrXguSxqsZ30geWYsyNTfWGOYqLUm4MExwmCIlKAWu4kcf9jkx+wK2DQNVknwBYa0yO41gzVuAitGbN2gIFZ0F5BUiUhf+pnDf6z/ELNwOsmyjPS4LehW5PXZ+Xole/5jehdJm6mzZQmm+aoUncbhNbFg0wMQdVwzDNkP6nFgl6Tu0Vtk8BZerRtCabfykwZLD1mF84uCZB+NA==  \r\n"
		+ "</SignatureValue>\r\n" + "</Signature>\r\n" + "<saml:Subject>\r\n"
		+ "<saml:NameID>ANONYMOUS</saml:NameID>\r\n" + "</saml:Subject>\r\n"
		+ "<saml:Conditions NotBefore=\"2017-11-06T13:20:11.164Z\" NotOnOrAfter=\"2017-11-06T13:20:41.164Z\"/>\r\n"
		+ "<saml:AttributeStatement>\r\n" + "<saml:Attribute Name=\"IP\">\r\n"
		+ "<saml:AttributeValue>10.208.170.66</saml:AttributeValue>\r\n" + "</saml:Attribute>\r\n"
		+ "<saml:Attribute Name=\"CAM\">\r\n" + "<saml:AttributeValue>0</saml:AttributeValue>\r\n"
		+ "</saml:Attribute>\r\n" + "</saml:AttributeStatement>\r\n" + "</saml:Assertion>");
    }

    @RequestMapping("/calcAge")
    public @ResponseBody String calcAge(Model model, @RequestParam String dob) {
	JSONObject rtnObj = new JSONObject();
	rtnObj.put("rtnCode", 0);
	try {
	    JSONObject requestObj = JSONObject.parseObject(IIPConsts._REQUEST_AGE_CALC);
	    String requestStr = requestObj.toJSONString();
	    requestStr = String.format(requestStr, dob);
	    HttpClientResult iipResp = HttpClientUtils.doPostRaw(IIPConsts._URL_AGE_CALC, requestStr, HEADERS, "utf-8");
	    if (iipResp != null && iipResp.getCode() == 200) {
		log.info("Age: " + iipResp.getCode() + "===========" + iipResp.getContent());
		JSONObject resObj = JSONObject.parseObject(iipResp.getContent());
		JSONObject responseDetails = (JSONObject) resObj.get("responseDetails");
		String reasonCode = responseDetails.getString("reasonCode");
		if (StringUtils.isNotBlank(reasonCode) && "0000".equals(reasonCode)) {
		    int anb = resObj.getIntValue("ageNextBirthDay");
		    rtnObj.put("rtnCode", 1);
		    rtnObj.put("anb", anb);
		}

	    }
	} catch (Exception e) {
	    rtnObj.put("rtnCode", 0);
	}
	return rtnObj.toJSONString();
    }

    @RequestMapping("/previewQuote")
    public @ResponseBody String previewQuote(Model model) {
	JSONObject rtnObj = new JSONObject();
	rtnObj.put("rtnCode", 1);
	try {

	    JSONObject requestObj = JSONObject.parseObject(IIPConsts._REQUEST_ARN);
	    HttpClientResult iipResp = HttpClientUtils.doPostRaw(IIPConsts._URL_ARN, requestObj.toJSONString(), HEADERS,
		    "utf-8");
	    log.info("ARN: " + iipResp.getCode() + "===========" + iipResp.getContent());
	    if (iipResp != null && iipResp.getCode() == 200) {
		JSONObject resObj = JSONObject.parseObject(iipResp.getContent());
		Long arn = resObj.getLong("applicationReferenceNumber");

		rtnObj.put("arn", arn);
		boolean flag = false;
		if (flag) {

		    if (arn != null && arn > 0) {

			requestObj = JSONObject.parseObject(IIPConsts._REQUEST_AGENT_PARTY_DETAILS);
			String requestURL = String.format(IIPConsts._URL_AGENT_PARTY_DETAILS, arn);
			log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode() + " ==== "
				+ iipResp.getContent());
			iipResp = HttpClientUtils.doPostRaw(requestURL, requestObj.toJSONString(), HEADERS, "utf-8");
			log.info("AgentPartyDeail: " + iipResp.getCode() + "===========" + iipResp.getContent());
			if (iipResp != null && iipResp.getCode() == 200) {

			    requestObj = JSONObject.parseObject(IIPConsts._REQUEST_INVOLVED_PARTIES);
			    requestURL = String.format(IIPConsts._URL_INVOLVED_PARTIES, arn);
			    iipResp = HttpClientUtils.doPostRaw(requestURL, requestObj.toJSONString(), HEADERS,
				    "utf-8");
			    log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode() + " ==== "
				    + iipResp.getContent());
			    log.info("INVOLVED_PARTIES: " + iipResp.getCode() + "===========" + iipResp.getContent());
			    if (iipResp != null && iipResp.getCode() == 200) {
				requestObj = JSONObject.parseObject(IIPConsts._REQUEST_COVERAGE);
				requestURL = String.format(IIPConsts._URL_COVERAGE, arn);
				iipResp = HttpClientUtils.doPostRaw(requestURL, requestObj.toJSONString(), HEADERS,
					"utf-8");
				log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode() + " ==== "
					+ iipResp.getContent());
				log.info("COVERAGE: " + iipResp.getCode() + "===========" + iipResp.getContent());

				if (iipResp != null && iipResp.getCode() == 200) {
				    requestObj = JSONObject.parseObject(IIPConsts._REQUEST_APPLICATION_PATCH);
				    requestURL = String.format(IIPConsts._URL_APPLICATION_PATCH, arn);
				    iipResp = HttpClientUtils.doPatchRaw(requestURL, requestObj.toJSONString(), HEADERS,
					    "utf-8");
				    log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode()
					    + " ==== " + iipResp.getContent());
				    log.info(
					    "Application: " + iipResp.getCode() + "===========" + iipResp.getContent());

				    if (iipResp != null && iipResp.getCode() == 200) {
					requestObj = JSONObject.parseObject(IIPConsts._REQUEST_LIFE_QUOTATION);
					requestURL = String.format(IIPConsts._URL_LIFE_QUOTATION, arn);
					iipResp = HttpClientUtils.doPostRaw(requestURL, requestObj.toJSONString(),
						HEADERS, "utf-8");
					log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode()
						+ " ==== " + iipResp.getContent());
					log.info("Life Quotation: " + iipResp.getCode() + "==========="
						+ iipResp.getContent());

					if (iipResp != null && iipResp.getCode() == 200) {

					    requestObj = JSONObject.parseObject(IIPConsts._REQUEST_LIFE_ILLUSTRATION);
					    requestURL = String.format(IIPConsts._URL_LIFE_ILLUSTRATION, arn, 2);
					    iipResp = HttpClientUtils.doPostRaw(requestURL, requestObj.toJSONString(),
						    HEADERS, "utf-8");
					    log.info("requestURL-->" + requestURL + "  || rESP -->" + iipResp.getCode()
						    + " ==== " + iipResp.getContent());
					    log.info("Life ILLUSTRATION: " + iipResp.getCode() + "==========="
						    + iipResp.getContent());

					}
				    }

				}

			    }
			}
		    }
		}
		model.addAttribute("arn", arn);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
	return rtnObj.toJSONString();
    }
}
