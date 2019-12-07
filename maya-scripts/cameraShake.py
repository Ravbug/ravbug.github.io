"""
cameraShake.py

Created by Ravbug (github.com/ravbug)
This script is a simple utility which adds customizable shake animation to a selection of objects
Like the script? Share it with your friends! I would recommend sharing the download link because I push updates on occasion
"""

import maya.OpenMaya as OpenMaya
import maya.OpenMayaUI as OpenMayaUI
import maya.cmds as cmds
import maya.mel as mel
import math
from random import *

Title = "Auto Camera Shake"
#main routine
def run(objects, startFrame, endFrame, factor,speed,speedmin,rotate,translate):
	#hide the main window
	#cmds.deleteUI(windowID)
	print (objects)
	cmds.currentTime(startFrame)
	count = 0
	while startFrame < endFrame:
		#forward the timeline a random amount
		startFrame+=randint(speedmin,speed)
		cmds.currentTime(startFrame)
		for i in range(0,len(objects)):
			if translate==True:
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".translateX",cmds.getAttr(objects[i]+".translateX")+diff)
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".translateY",cmds.getAttr(objects[i]+".translateY")+diff)
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".translateZ",cmds.getAttr(objects[i]+".translateZ")+diff)
			if rotate == True:
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".rotateX",cmds.getAttr(objects[i]+".rotateX")+diff)
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".rotateY",cmds.getAttr(objects[i]+".rotateY")+diff)
				diff=uniform(-factor,factor)
				cmds.setAttr(objects[i]+".rotateZ",cmds.getAttr(objects[i]+".rotateZ")+diff)
			mel.eval("setKeyframe -breakdown 0 -hierarchy none -controlPoints 0 -shape 0 " + objects[i] + ";")
		count += 1
	dialog("Animated " + str(len(objects)) + " objects and\n set " + str(count) + " keys on each.")
		
		
#windowing
def createWindow():
	# remove old window if exists
	global windowID
	windowID = 'shaker'
	if cmds.window(windowID, exists=True):
		cmds.deleteUI(windowID)
	
	#instructions
	window = cmds.window(windowID, title=Title, width=170)
	cmds.frameLayout("main", label=Title)
	cmds.separator(height=2)
	cmds.text("Created by Ravbug (github.com/ravbug)")
	cmds.separator(height=2)

	cmds.text("Select the objects you want to shake. \nThen fill the fields and press Shake!")

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
	cmds.text("Factor")
	global fac
	fac = cmds.floatField("fac",value=0.1)
	cmds.text("Delay")
	global speed
	speed = cmds.intField("speed",value=10)
	cmds.text("Min Delay")
	global speed
	speedmin = cmds.intField("speedmin",value=1)
	
	cmds.columnLayout('btn')
	cmds.setParent('opt')
	
	#these are backwards
	global occ
	occ = cmds.checkBox("occlusion",label="Rotational Shake",annotation="Keyframe shake on Rotational axis",v=True)
	global rot
	rot = cmds.checkBox("rotational",label="Translate Shake",annotation="Keyframe shake on Translate axis",v=True)
	#scan button
	cmds.button(label="Shake!",width=180,command="validate()");
	cmds.showWindow(windowID)

#validate (sanity check) and run the script
def validate():
	#read in values (get overwritten if TimeSlider is enabled)
	start = mel.eval("intField -q -value StartFrame")
	end = mel.eval("intField -q -value EndFrame") + 1
	fac = mel.eval("floatField -q -value fac")
	speed = mel.eval("intField -q -value speed")
	speedmin = mel.eval("intField -q -value speedmin")

	
	
	if cmds.checkBox(timeslider,query=True,value=True):
		start=mel.eval("playbackOptions -q -minTime;")
		end=mel.eval("playbackOptions -q -maxTime;") + 1
		
	#sanity check ranges
	if start > end:
		dialog("Start frame cannot exceed End frame")
		return
	# enable Camera Based Selection for Occlusion check
	occlusion = mel.eval("checkBox -q -value occlusion")
	rot = mel.eval("checkBox -q -value rotational")
	
	#run the engine
	run (cmds.ls(sl=True),start,end,fac,speed,speedmin,occlusion,rot)
	

#results dialog
def dialog(msg):
	if cmds.window(windowID, exists=True):
		cmds.deleteUI(windowID)
		
	#window properties
	window = cmds.window(windowID, title=Title, width=170,height=40)
	cmds.frameLayout("main", label=Title)
	cmds.separator(height=2)
	cmds.text(msg)
	cmds.showWindow(windowID)
	
createWindow()
