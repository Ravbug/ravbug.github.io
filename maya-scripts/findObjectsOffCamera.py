"""
findObjectsOffCamera.py
Created by Ravbug (github.com/ravbug)
This script is a simple utility which finds all the objects which never appear on screen.
Like the script? Share it with your friends! I would recommend sharing the download link because I push updates on occasion
"""

import maya.OpenMaya as OpenMaya
import maya.OpenMayaUI as OpenMayaUI
import maya.cmds as cmds
import maya.mel as mel
import math

def run(startFrame, endFrame, byFrame, view, occlusion):
	#hide the main window
	cmds.deleteUI(windowID)
	objects = []
	for f in frange5(startFrame,endFrame, byFrame):
		#set the current frame
		cmds.currentTime(f)
		#select objects in the view
		OpenMaya.MGlobal.selectFromScreen(0, 0, view.portWidth(), view.portHeight(), OpenMaya.MGlobal.kReplaceList)
		temp = cmds.ls(sl=True)
		#add the now selected objects to the master array
		objects = objects + temp

	#select all the objects in the master array
	cmds.select(objects);
	#invert selection
	mel.eval("invertSelection");
	
	#log out to window
	num = len(cmds.ls(sl=True))
	word = " objects"
	if num == 1:
		word = "object"
	dialog("Scanned frames " + str(startFrame) + " - " + str(endFrame-1) + ", found " + str(num) +  word)
	


#floating point range object for above
def frange5(limit1, limit2 = None, increment = 1.):

  if limit2 is None:
    limit2, limit1 = limit1, 0.
  else:
    limit1 = float(limit1)

  count = int(math.ceil(limit2 - limit1)/increment)
  return (limit1 + n*increment for n in range(count))

#windowing
def createWindow():
	# remove old window if exists
	global windowID
	windowID = 'objDedetctor'
	if cmds.window(windowID, exists=True):
		cmds.deleteUI(windowID)
	
	#instructions
	window = cmds.window(windowID, title="Find Objects Offscreen", width=170)
	cmds.frameLayout("main", label="Find Objects Offscreen")
	cmds.separator(height=2)
	cmds.text("Created by Ravbug (github.com/ravbug)")
	cmds.separator(height=2)

	cmds.text("Go into a single view layout\nwith the camera you want to scan. \nThen press [Scan]\n\nThe program will select all objects\nthat never appear on-screen.")
	cmds.text("Set all layer display types to normal \n(not Template or Reference)")

	cmds.separator(height=2)
	
	#options
	cmds.frameLayout("opt",label="Options")
	global timeslider
	timeslider = cmds.checkBox("  Use Time Slider Range",v=True)
	cmds.text("Use Custom Frame Range",align="left")
	cmds.rowColumnLayout('rlOpts', nc=2, cw=[(1,90)])
	cmds.text("Start Frame")
	global start
	start = cmds.intField("StartFrame",value=1)
	cmds.text("End Frame")
	global end
	end = cmds.intField("EndFrame",value=10)
	cmds.text("By Frame")
	global by
	by = cmds.floatField("ByFrame",value=1)
	
	cmds.columnLayout('btn')
	cmds.setParent('opt')
	
	global occ
	occ = cmds.checkBox("occlusion",label="Occlusion Search",annotation="Find objects hidden behind other objects")
	#scan button
	cmds.button(label="Scan",width=180,command="validate()");
	cmds.showWindow(windowID)

#validate (sanity check) and run the script
def validate():
	#read in values (get overwritten if TimeSlider is enabled)
	start = mel.eval("intField -q -value StartFrame")
	end = mel.eval("intField -q -value EndFrame") + 1
	by = mel.eval("floatField -q -value ByFrame")
	
	if cmds.checkBox(timeslider,query=True,value=True):
		start=mel.eval("playbackOptions -q -minTime;")
		end=mel.eval("playbackOptions -q -maxTime;") + 1
		
	#sanity check ranges
	if start > end:
		dialog("Start frame cannot exceed End frame")
		return
	# enable Camera Based Selection for Occlusion check
	occlusion = mel.eval("checkBox -q -value occlusion")
	prevSetting = mel.eval("selectPref -q -useDepth")
	mel.eval("selectPref -useDepth " + str(occlusion).lower())	
	
	#run the engine
	run(start,end,by,OpenMayaUI.M3dView.active3dView(),True)
	
	# set the camera based selection back to what it was before (best practice is to not modify user settings, or if they are modified, to set them back)
	mel.eval("selectPref -useDepth " + str(prevSetting))

	
def dialog(msg):
	if cmds.window(windowID, exists=True):
		cmds.deleteUI(windowID)
		
	#window properties
	window = cmds.window(windowID, title="Find Objects Offscreen", width=170,height=40)
	cmds.frameLayout("main", label="Find Objects Offscreen")
	cmds.separator(height=2)
	cmds.text(msg)
	cmds.showWindow(windowID)
	
#launch script
createWindow()
