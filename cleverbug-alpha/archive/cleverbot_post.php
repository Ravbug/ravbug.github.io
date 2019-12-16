<?php

$url_orig = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

//get the text query
$string = $_GET['str'];

$spacecount = substr_count($string," ");

//check length of string (to avoid giant posts)
if (strlen($string) > 2 && strlen($string) <= 300 && $spacecount >= 1){
	$blacklist = array("This used to contain a list of blacklisted words, which have been removed for obvious reasons.");
	
	$ok = true;
	
	
	$simplified = strtolower(preg_replace('/\s+/', '', $string));
	
	foreach ($blacklist as $value){
		if (strpos($simplified, $value) !== false){
			$ok = false;
			break;
		}
	}
	
	if ($ok == true){
		echo "'". $string. "' passed validation, posting...\n" ;
		//$_SERVER['REQUEST_TIME'];
		//$_SERVER['HTTP_REFERER'];
		$urlParts = parse_url($_SERVER['HTTP_REFERER']);
		$ip = gethostbyname($urlParts['host']);
		$spreadsheetId = "17bX4lpW5ayTfVjivtImeAQlCEouQ8Z5B4Nz-_jBrpvM";
		$key = "removed for obvious reasons";
		
		//get the number of table cells already in the document
		$url = "https://sheets.googleapis.com/v4/spreadsheets/". $spreadsheetId . "?key=" . $key;
		$result =  file_get_contents ($url, false); //this is the full JSON response to this
		$result = json_decode($result,true);
		$numRows = $result["sheets"][0]["properties"]["gridProperties"]["rowCount"];
		
		//set up the range
		$range = "Data!A" . (string)($numRows +0) . ":C" . (string)($numRows + 0) . "";

		$valueInputOption="RAW";
		
		$values = array(array($_SERVER['REQUEST_TIME'],$string));
		
		//$url = "https://sheets.googleapis.com/v4/spreadsheets/". $spreadsheetId ."/values/". $range . "?valueInputOption=USER_ENTERED&key=" . $key;


		//now for the google sheets writing
		
		//load the google API Libs (not performed earlier because we don't want unnecesary work performed
		require_once 'google-api-php-client-2.2.0_PHP54/vendor/autoload.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ServiceRequestInterface.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/DefaultServiceRequest.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/Exception.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/UnauthorizedException.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ServiceRequestFactory.php';
		require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/SpreadsheetService.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/SpreadsheetFeed.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/Spreadsheet.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/WorksheetFeed.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/Worksheet.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ListFeed.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ListEntry.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/CellFeed.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/CellEntry.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/Util.php';

		//Make a client object
		//TODO: here is the problem step
		define('APPLICATION_NAME', 'Cleverbot_Server');
		//define('CREDENTIALS_PATH', '~/.credentials/sheets.googleapis.com-php-quickstart.json');
		define('CLIENT_SECRET_PATH', __DIR__ . '/client_secret.json');
		define('SCOPES', implode(' ', array(
		  Google_Service_Sheets::SPREADSHEETS)
		));
		

		$client = new Google_Client();
		$client->setApplicationName(APPLICATION_NAME);
		$client->setScopes(SCOPES);
		$client->setAuthConfig(CLIENT_SECRET_PATH);		
		
		//Make service object out of client object
		$service = new Google_Service_Sheets($client);


		//the data write request
		$body = new Google_Service_Sheets_ValueRange(array(
		  'values' => $values
		));

		$params = array(
		  'valueInputOption' => $valueInputOption
		);
		http_response_code(200);
		//problematic line
		echo "Readying for post...";
		//send the actual post request with data
		
	
		try{
			$result = $service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);
			//print_r($result);
			http_response_code(200);
			echo "Posted!";
		} catch (Exception $e){
			echo "Internal Server Error. Unable to post because: \n " . $e;
			http_response_code(500);
		}
		
		//now add a row to the end
		addRowToSpreadsheet($service,$spreadsheetId,$Data,[]);
		}
	
	else{
		echo "'". $string. "' failed validation, not posting.";
		http_response_code(403);
	}	
}
else{
	echo "'" . $string . "' is too short or too long. Not posting.";
	http_response_code(400);
}
//A function which adds rows to a google sheet
function addRowToSpreadsheet($sheetsService, $spreadsheetId, $sheetId, $newValues = []) {
    // Build the CellData array
    $values = [];
    foreach ($newValues AS $d) {
        $cellData = new Google_Service_Sheets_CellData();
        $value = new Google_Service_Sheets_ExtendedValue();
        $value->setStringValue($d);
        $cellData->setUserEnteredValue($value);
        $values[] = $cellData;
    }
    // Build the RowData
    $rowData = new Google_Service_Sheets_RowData();
    $rowData->setValues($values);
    // Prepare the request
    $append_request = new Google_Service_Sheets_AppendCellsRequest();
    $append_request->setSheetId($sheetId);
    $append_request->setRows($rowData);
    $append_request->setFields('userEnteredValue');
    // Set the request
    $request = new Google_Service_Sheets_Request();
    $request->setAppendCells($append_request);
    // Add the request to the requests array
    $requests = array();
    $requests[] = $request;
    // Prepare the update
    $batchUpdateRequest = new Google_Service_Sheets_BatchUpdateSpreadsheetRequest(array(
        'requests' => $requests
    ));

    try {
        // Execute the request
        $response = $sheetsService->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
        if ($response->valid()) {            
            return true;// Success, the row has been added
        }
    } catch (Exception $e) {        
        error_log($e->getMessage());// Something went wrong
    }

    return false;
}
?>