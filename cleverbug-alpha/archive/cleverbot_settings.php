<?php
header('Content-Type: application/json');
//In order for this script to work, you must share the google sheet with the client_email in client_secret.json

//password supplied: Will only overwrite data if the password is correct (supplied as base64)
$pwd = $_GET['p'];
$correct = "MThsUmFXWDY0V2txYm80RA==";
$spreadsheetId = "17bX4lpW5ayTfVjivtImeAQlCEouQ8Z5B4Nz-_jBrpvM";
$sheetID = "149417258"; //the google sheet ID to post to (not the spreadsheet id, the sheet id)

//this always overwrites the data. It is the client's responsibility to keep the size down. The server will refuse data that is too large.

if ($pwd == $correct){
	
	//get the text query
	$string = $_GET['str'];
	//set up the range and postdata
	
	//set up the write string (ServerID, object data)
	$values = makeValues($string);

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

	//clear out spreadsheet
	batchClearSpreadsheet($service,$spreadsheetId,$sheetID);
	//now write in the data
	/*$values = [
	    ["5","6"],
	    ["3","4"]
	    // Additional rows ...
	];*/
	batchWriteSpreadsheet($service,$spreadsheetId,$sheetID,"Data!A:B",$values);
	echo json_encode("Success!");
	http_response_code(200);

}
else{
	http_response_code(403);
	echo json_encode("Forbidden");
}
function batchClearSpreadsheet($service,$spreadsheetId,$sheetId){
	//set up the clear request
	$requestBody = new Google_Service_Sheets_BatchClearValuesRequest([
		"ranges" => "Data!A:B"
	]);
	try{
		$response = $service->spreadsheets_values->batchClear($spreadsheetId, $requestBody);
		//echo json_encode($response);
	}
	catch(Exception $e){
	echo json_encode($e);
	}

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
//A function which makes the Values object for the batch write, originating with the JSON data
function makeValues($garble){
	$json = json_decode($garble);
	$values = [];
	 foreach($json as $key => $value) {
	 	array_push($values,[$key,$value]);

	  }
	  return $values;
	//echo json_encode($json);
}
?>