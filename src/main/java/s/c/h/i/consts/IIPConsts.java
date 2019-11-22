package s.c.h.i.consts;

public class IIPConsts {

    public static final String SERVER = "https://tpcd-uat2-sg.hsbc.com.hk/sguat";

    public static String _URL_AGE_CALC = SERVER + "/insurance/api/v1/7/calcAge";
    public static String _URL_ARN = SERVER + "/insurance/api/v1/1/applications";
    public static String _URL_AGENT_PARTY_DETAILS = SERVER + "/insurance/api/v1/2/applications/%s/agentpartydetails";
    public static String _URL_INVOLVED_PARTIES = SERVER + "/insurance/api/v1/3/applications/%s/involved-parties";
    public static String _URL_COVERAGE = SERVER + "/insurance/api/v1/4/applications/%s/coverages";
    public static String _URL_APPLICATION_PATCH = SERVER + "/insurance/api/v1/1/applications/%s";
    public static String _URL_LIFE_QUOTATION = SERVER + "/insurance/api/v1/5/applications/%s/life-quotations";
    public static String _URL_LIFE_ILLUSTRATION = SERVER + "/insurance/api/v1/6/applications/%s/life-illusrtation/%s";

    public static String _REQUEST_AGE_CALC = "{\r\n" + "    \"groupInsCalcAgeDtls\": {\r\n"
	    + "        \"dateOfBirth\": \"%s\"\r\n" + "    }\r\n" + "}";
    public static String _REQUEST_ARN = "{\r\n" + "\"policyDetails\": {\r\n" + "\"productCode\": \"JG3\"\r\n" + "}\r\n"
	    + "}";

    public static String _REQUEST_AGENT_PARTY_DETAILS = "{\r\n" + "    \"agentPartyDetails\": {\r\n"
	    + "        \"staffMemberName\": \"Tny\",\r\n" + "        \"userIdNumber\": \"42775454\",\r\n"
	    + "        \"agentPartyTypeCode\": \"BR\"\r\n" + "    }\r\n" + "}";

    public static String _REQUEST_INVOLVED_PARTIES = "{\r\n" + "	\"involvedParties\":\r\n" + "	[{\r\n"
	    + "		\"applicationArrangement\":{\r\n" + "			\"involvedPartyRole\":[\r\n"
	    + "				\"applicant\"\r\n" + "			],\r\n"
	    + "			\"individualName\":{\r\n" + "				\"givenName\":\"John\",\r\n"
	    + "				\"lastName\":\"Have\"\r\n" + "			}\r\n" + "		}\r\n"
	    + "	},\r\n" + "	{\r\n" + "		\"applicationArrangement\":{\r\n"
	    + "			\"involvedPartyRole\":[\r\n" + "				\"insured\"\r\n"
	    + "			],\r\n" + "			\"individualName\":{\r\n"
	    + "				\"givenName\":\"John\",\r\n"
	    + "				\"lastName\":\"Have\"\r\n" + "			},\r\n"
	    + "			\"individual\":{\r\n"
	    + "				\"birthDate\":\"1998-02-02\",\r\n"
	    + "				\"genderCode\":\"M\"\r\n" + "			}\r\n" + "		}\r\n"
	    + "	}]\r\n" + "}";

    public static String _REQUEST_COVERAGE = "{\r\n" + "	\"insuranceCoverageApplication\": [{\r\n"
	    + "			\"coverageCategoryCode\": \"B\",\r\n"
	    + "			\"coverageCode\": \"J3GR\",\r\n"
	    + "			\"coverageAmountCurrencyCode\": \"USD\",\r\n"
	    + "			\"coverageAmount\": 750001,\r\n"
	    + "			\"selectedCoverageIndicator\": true,\r\n"
	    + "			\"insuredObjectIdentification\": [{\r\n"
	    + "				\"insuredObjectIdentifier\": 1,\r\n"
	    + "				\"insuredObjectType\": \"PERSON\"\r\n" + "			}],\r\n"
	    + "			\"coverageOptions\": [{\r\n"
	    + "				\"coverageOptionCode\": \"GIRLP\",\r\n"
	    + "				\"coverageOptionValue\": \"1\"\r\n" + "			}]\r\n"
	    + "		},\r\n" + "		{\r\n" + "			\"coverageCategoryCode\": \"R\",\r\n"
	    + "			\"coverageCode\": \"NLS\",\r\n"
	    + "			\"coverageTypeyCode\": \"STD\",\r\n"
	    + "			\"selectedCoverageIndicator\": true,\r\n"
	    + "			\"coverageOptions\": [{\r\n"
	    + "				\"coverageOptionCode\": \"PRMSLV\",\r\n"
	    + "				\"coverageOptionValue\": \"ENDPRM\"\r\n" + "			}]\r\n"
	    + "		},\r\n" + "		{\r\n" + "			\"coverageCategoryCode\": \"R\",\r\n"
	    + "			\"coverageCode\": \"FESR\",\r\n"
	    + "			\"selectedCoverageIndicator\": true,\r\n"
	    + "			\"coverageTermPeriodicityCode\": \"L\",\r\n"
	    + "			\"coverageAmountCurrencyCode\": \"\",\r\n"
	    + "			\"coverageAmount\": \"\"\r\n" + "		}\r\n" + "	]\r\n" + "}";

    public static String _REQUEST_APPLICATION_PATCH = "{\r\n" + "\"policyDetails\": {\r\n"
	    + "\"policyStartOptionCode\": \"BD\",\r\n" + "\"paymentStartDate\": \"2019-02-02\",\r\n"
	    + "\"policyPaymentDetails\": {\r\n" + "\"paymentTermPeriodicityCode\": \"A\",\r\n"
	    + "\"paymentTermNumber\": \"1\"\r\n" + "}\r\n" + "}\r\n" + "}";

    public static String _REQUEST_LIFE_QUOTATION = "{\r\n" + "    \"involvedPartyIdentificationNumber\": 2,\r\n"
	    + "    \"policyDetails\": {\r\n" + "        \"productCode\": \"JG3\"\r\n" + "    },\r\n"
	    + "    \"underWritingClassDetails\": {\r\n" + "        \"underWritingClassCode\": \"SN250\"\r\n"
	    + "    },\r\n" + "    \"insuranceRatingDetails\": {\r\n"
	    + "        \"insuranceRatingCategoryCode\": \"IRRATE\",\r\n"
	    + "        \"insuranceRatingScoreCode\": \"A+\",\r\n"
	    + "        \"insuredResidencyText\": \"Singapore\"\r\n" + "    },\r\n" + "    \"healthAndLifestyle\": {\r\n"
	    + "        \"smokerIndicator\": false\r\n" + "    }\r\n" + "}";

    public static String _REQUEST_LIFE_ILLUSTRATION = "{\r\n" + "\"insurancePolciyDetails\": {\r\n"
	    + "\"productCode\": \"JG3\",\r\n" + "\"quotationReferenceNumber\": \"1548995183206-4129\",\r\n"
	    + "\"insuranceCoverageDetails\": [\r\n" + "{\r\n" + "\"coverageSequenceNumber\": 1\r\n" + "},\r\n" + "{\r\n"
	    + "\"coverageSequenceNumber\": 2\r\n" + "},\r\n" + "{\r\n" + "\"coverageSequenceNumber\": 3\r\n" + "}\r\n"
	    + "]\r\n" + "}\r\n" + "}";

}
