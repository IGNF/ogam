#!/usr/bin/env python

import sys
sys.path.append("../tools")
import mergejs

have_compressor = None
try:
    import jsmin
    have_compressor = "jsmin"
except ImportError:
    try:
        import minimize
        have_compressor = "minimize"
    except Exception, E:
        print E
        pass

sourceDirectory = "../mapfish"
configFilename = "lite.cfg"
outputFilename = "MapFish.js"

if len(sys.argv) > 1:
    configFilename = sys.argv[1]
    extension = configFilename[-4:]

    if extension  != ".cfg":
        configFilename = sys.argv[1] + ".cfg"

if len(sys.argv) > 2:
    outputFilename = sys.argv[2]

print "Merging libraries."
merged = mergejs.run(sourceDirectory, None, configFilename)
if have_compressor == "jsmin":
    print "Compressing using jsmin."
    minimized = jsmin.jsmin(merged)
elif have_compressor == "minimize":
    print "Compressing using minimize."
    minimized = minimize.minimize(merged)
else: # fallback
    print "Not compressing."
    minimized = merged 

print "Writing to %s." % outputFilename
file(outputFilename, "w").write(minimized)

print "Done."
