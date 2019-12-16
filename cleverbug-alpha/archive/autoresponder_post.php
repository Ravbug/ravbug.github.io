<?php
//header('Content-Type: application/json');
//In order for this script to work, you must share the google sheet with the client_email in client_secret.json

//password supplied: Will only overwrite data if the password is correct (supplied as base64)
$pwd = $_GET['p'];
$correct = "MThsUmFXWDY0V2txYm80RA==";	//this is definitely not secure but works well enough
$spreadsheetId = "[redacted]";
$sheetID = "584068044"; //the google sheet ID to post to (not the spreadsheet id, the sheet id)

//this always overwrites the data. It is the client's responsibility to keep the size down. The server will refuse data that is too large.
//incoming values must be encoded in base64, to ensure they will get here intact.

if ($pwd == $correct){
	//see if the spreadsheet has string in it
	
	//set up the write string (ServerID, object data)
	$string = $_GET['str'];
	$values = makeValues($string);
	
	$response = "";
	$count = 0;
	$row = 0;
	//autoresponder or Cleverbug?
	if ($_GET["c"] == 1){
		$query = "https://sheets.googleapis.com/v4/spreadsheets/[redacted]/values/Settings!A2:C?key=[redacted]";
		$spreadsheetId = "[redacted]";
		$sheetID = "149417258";
		
		//get response
		$response = file_get_contents($query,false);
		$response = json_decode($response,true);
		//print_r($response["values"]);
		for ($i = 0; $i < count($response["values"]); $i++){
			echo $response["values"][$i][0] . " == " . $values[0][0] . "<br>";

			if (strcmp($response["values"][$i][0],$values[0][0]) == 0){
				echo "Found!<br>";
				$count=1;
				$row = $response["values"][$i][2];
			}
		}
		echo $row;
	}
	else{
		//See Get the server prefs row if it exists
		$sql = "SELECT * WHERE A contains '" . $values[0][0] . "'";
		$query = "https://docs.google.com/spreadsheets/d/". $spreadsheetId . "/gviz/tq?tq=" . $sql;
		//echo json_encode($query);
		//get the text query
		$string = $_GET['str'];
		//set up the range and postdata
		//make it URL-safe by repacing space with %20
		$query = preg_replace('/\s+/', '%20', $query);
		$response = file_get_contents($query,false);
		$response = substr($response,strpos($response,"(")+1,-2);
		$response = json_decode($response,true);
		//get number of responses matching
		$count = count($response["table"]["rows"]);
		if ($count > 0){
			$row = $response["table"]["rows"][0]["c"][2]["v"];
		}
	}
	
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
	define('APPLICATION_NAME', 'AutoResponder_Server');
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

	//clear out spreadsheet (not needed)
	//batchClearSpreadsheet($service,$spreadsheetId,$sheetID);
	//now write in the data
	/*$values = [
	    ["5","6"],
	    ["3","4"]
	    // Additional rows ...
	];*/
	//delete row if 'd' arg is present
	//for now it simply clears the rows out. In the future this should actually delete the cell.
	if ($_GET['d'] == 1){
		//$row = $response["table"]["rows"][0]["c"][2]["v"];
		$range = "Settings!A" . $row . ":B" . $row;
		batchWriteSpreadsheet($service,$spreadsheetId,$sheetID,$range,array(array("","")));
	}
	else if ($count == 0){
		addRowToSpreadsheet($service,$spreadsheetId,$sheetID,$values[0]);
	}
	else{
		$range = "Settings!A" . $row . ":B" . $row;
		batchWriteSpreadsheet($service,$spreadsheetId,$sheetID,$range,$values);
	}
	echo json_encode("Success!");
	http_response_code(200);

}
else{
	http_response_code(403);
	echo json_encode("Forbidden");
}

//a function to write a set of values to the sheet
function batchWriteSpreadsheet($service,$spreadsheetId,$sheetId,$range,$values){
	$data = [];
	$data[] = new Google_Service_Sheets_ValueRange([
	  'range' => $range,
	  'values' => $values,
	  'majorDimension' => "ROWS"
	]);
	$body = new Google_Service_Sheets_BatchUpdateValuesRequest([
	  'valueInputOption' => "RAW",
	  'data' => $data
	]);

	try{
		$result = $service->spreadsheets_values->batchUpdate($spreadsheetId, $body);
		//echo json_encode($result);
	}
	catch(Exception $e){
		echo json_encode($e);
	}
	
	
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
//A function which makes the Values object for the batch write, originating with the JSON data
function makeValues($garble){
	$json = json_decode($garble);
	$values = [];
	 foreach($json as $key => $value) {
	 	array_push($values,[$key,base64_decode($value)]);

	  }
	  return $values;
	//echo json_encode($json);
}
?>