<?php

$url_orig = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
header('Content-Type: application/json');

//get the text query
$string = $_GET['str'];
$prevstring = $_GET['prevstr'];
$server = $_GET['serv'];
$UID = $_GET['uid'];
$sheetID = "342487029"; //the google sheet ID to post to (not the spreadsheet id, the sheet id)
$spacecount = substr_count($string," ");

//check length of string (to avoid giant posts or short spam)
if (strlen($string) > 2 && strlen($string) <= 300 && $spacecount >= 1){

	$simplified = minify($string);
	//check to make sure someone isn't trolling the bot by repeating what it says
	if ($simplified == minify($prevstring)){
		echo json_encode("Post Failed with reason: str and prevstr match");
		http_response_code(400);
		return;
	}
	$blacklist = str_getcsv(file_get_contents("cleverbot_badwords.txt",true));

	//screen for bad words
	foreach ($blacklist as $value){
		if (strpos($simplified, $value) !== false){
			//if a bad word is found, report and halt immediately
			echo json_encode("FORBIDDEN: Post failed with reason: validation error -> '" . $string . "' failed validation.");
			http_response_code(403);
			return;
		}
	}
	
	//Spam filter: make sure the current item isn't already in the DB
	//TODO: can we recreate this using Data Validation (data menu) in the google sheet? Having the sheet do this work will vastly speed up the validator
	$spreadsheetId = "17bX4lpW5ayTfVjivtImeAQlCEouQ8Z5B4Nz-_jBrpvM";
	//see if the spreadsheet has string in it
	$sql = "SELECT * WHERE E='" . $simplified . "' LIMIT 1";
	$query = "https://docs.google.com/spreadsheets/d/". $spreadsheetId . "/gviz/tq?tq=" . $sql;
	//make it URL-safe by repacing space with %20
	$query = preg_replace('/\s+/', '%20', $query);
	$response = file_get_contents($query,false);
	$response = substr($response,strpos($response,"(")+1,-2);
	$response = json_decode($response,true);

	//get number of responses matching
	$count = count($response["table"]["rows"]);
 	
 	$exists = false;
 	
 	//echo $query;
	//if present, check cell C's length
	//see if there's an exact match (based on minify())
	if ($count > 0){
		for ($i=0; $i<$count; $i++){
			$data = $response["table"]["rows"][$i]["c"][2]["v"];
			if (minify($data) == $simplified){
				$exists = true;
			}
		}
	}
	//if not present, add a new row to the db with the info
	//otherwise abort
	if (! $exists){	
		//set up the range and postdata
		$range = "Data2!A" . (string)($numRows) . ":E" . (string)($numRows) . "";
		
		if ($UID == "web"){
			$UID = "web @" . base64_encode(getRealIpAddr());
		}
		
		//set up the write string (date, prevstring,
		$values = array(date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']),strtolower(preg_replace('/\s+/', '', trim($prevstring))),$string,$server . "[" . $UID . "]");

		//now for the google sheets writing
		
		//load the google API Libs (not performed earlier because we don't want unnecesary work performed
		require_once 'google-api-php-client-2.2.0_PHP54/vendor/autoload.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ServiceRequestInterface.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/DefaultServiceRequest.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/Exception.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/UnauthorizedException.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/ServiceRequestFactory.php';
		//require_once 'php-google-spreadsheet-client/src/Google/Spreadsheet/SpreadsheetService.php';
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

		//now add a row to the end
		addRowToSpreadsheet($service,$spreadsheetId,$sheetID,$values);
		echo json_encode("Post succeeded, added '" . $string . "'");
		http_response_code(200);

	}
	else{
		echo json_encode( "FORBIDDEN: Post failed with reason: spam error -> '" . $string . "' already exists");
		http_response_code(403);
	}	
	
}
else{
	echo json_encode("Post failed with reason: size error -> '" . $string . "' is too long or too short.");
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
        echo json_encode($e);
    }
    

    return false;
}

function minify($str){
	return strtolower(preg_replace('/\s+/', '', trim($str)));
}

//gets the real (non-proxy, hopefully) ip of the sender
function getRealIpAddr()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP']))   //check ip from share internet
    {
      $ip=$_SERVER['HTTP_CLIENT_IP'];
    }
    elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))   //to check ip is pass from proxy
    {
      $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    else
    {
      $ip=$_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

?>