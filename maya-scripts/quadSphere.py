"""
quadSphere.py

Created by Ravbug (github.com/ravbug)
This script is a simple utility which creates a sphere with no triangles in your scene.
Like the script? Share it with your friends! I would recommend sharing the download link because I push updates on occasion.

Put the following as your double-click action for a UI-less shortcut to the generator:

import maya.cmds as cmds
import maya.mel as mel

def run(smooth,radius):
    radius = str(radius)
    mel.eval("polyCube -w " + radius + " -h " + radius + " -d " + radius + " -sx 1 -sy 1 -sz 1 -ax 0 1 0 -cuv 4 -ch 1;")
    name = mel.eval("ls -sl")[0] 
    mel.eval("polySmooth -mth 0 -sdt 2 -ovb 1 -ofb 3 -ofc 0 -ost 1 -ocr 0 -dv " + str(smooth) + " -bnr 1 -c 1 -kb 1 -ksb 1 -khe 0 -kt 1 -kmb 1 -suv 1 -peh 0 -sl 1 -dpe 1 -ps 0.1 -ro 1 -ch 1")
    mel.eval("select -cl;select -r " + str(name))
    
run(3,1)
"""

import maya.cmds as cmds
import maya.mel as mel

Title = "Quad Sphere Options"
#main routine

#windowing
def createWindow():
	# remove old window if exists
	global windowID
	windowID = 'quadSphere'
	if cmds.window(windowID, exists=True):
		cmds.deleteUI(windowID)
	
	#instructions
	window = cmds.window(windowID, title=Title, width=170)
	cmds.frameLayout("main", label=Title)
	cmds.separator(height=2)
	cmds.text("Created by Ravbug (github.com/ravbug)")
	cmds.separator(height=2)

	cmds.text("Creates a sphere with no triangles\n or poles on your grid.")

	cmds.separator(height=2)
	
	#options
	cmds.frameLayout("opt",label="Options")
	cmds.rowColumnLayout('rlOpts', nc=2, cw=[(1,90)])
	
	cmds.text("Subdivision level")
	cmds.intField("smooth",value=3)
	
	cmds.text("Radius")
	cmds.floatField("radius",value=1)
	
	cmds.columnLayout('btn')
	cmds.setParent('opt')
	
	#these are backwards
	global history
	history = cmds.checkBox("history",label="Delete History",annotation="After creation, delete history",v=False)

	#run button
	cmds.rowColumnLayout('btn2Col',nc=2)
	cmds.button(label="Create",width=180,command="validate()");
	cmds.button(label="Apply",width=180,command="validate(False)");

	cmds.showWindow(windowID)
	
#validate (sanity check) and run the script
def validate(close=True):
	#read in values (get overwritten if TimeSlider is enabled)
	smooth = mel.eval("intField -q -value smooth")
	radius = mel.eval("floatField -q -value radius")
	
	hist = False
	
	if cmds.checkBox(history,query=True,value=True):
		hist = True
		
	run (smooth,radius,hist)
	
	if close:
	    cmds.deleteUI(windowID)


def run(smooth,radius,hist):
    radius = str(radius)
    mel.eval("polyCube -w " + radius + " -h " + radius + " -d " + radius + " -sx 1 -sy 1 -sz 1 -ax 0 1 0 -cuv 4 -ch 1;")
    
    #get name of the object created
    name = mel.eval("ls -sl")[0]
    
    mel.eval("polySmooth -mth 0 -sdt 2 -ovb 1 -ofb 3 -ofc 0 -ost 1 -ocr 0 -dv " + str(smooth) + " -bnr 1 -c 1 -kb 1 -ksb 1 -khe 0 -kt 1 -kmb 1 -suv 1 -peh 0 -sl 1 -dpe 1 -ps 0.1 -ro 1 -ch 1")
   
    if hist:
       mel.eval("DeleteHistory;")
    
    mel.eval("select -cl;select -r " + str(name))
    
createWindow()
