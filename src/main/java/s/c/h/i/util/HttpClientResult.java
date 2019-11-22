package s.c.h.i.util;

import java.io.Serializable;

public class HttpClientResult implements Serializable {

	private int code;

	private String content;

	public HttpClientResult(int statusCode, String content2) {
		this.code = statusCode;
		this.content = content2;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

}
