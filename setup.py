import sys

args = sys.argv

if len(args) < 2:
  print("Usage: " + args[0] + " [Stack_name]")
  exit(-1)

stack_name = args[1]

dbtables = open('layer_template/dbtables.js','r')
text = dbtables.read()
text = text.replace("$[STACK_NAME]", stack_name)
dbtables.close()

dbtables = open('layers/db-tables/dbtables.js','w')
dbtables.write(text)
dbtables.close()

photos = open('layer_template/photos.js','r')
text = photos.read()
text = text.replace("$[STACK_NAME]", stack_name)
photos.close()

photos = open('layers/db-tables/photos.js','w')
photos.write(text)
photos.close()

config = open('layer_template/samconfig.toml','r')
text = config.read()
text = text.replace("$[STACK_NAME]", stack_name)
config.close()

config = open('samconfig.toml','w')
config.write(text)
config.close()
print("Successfully changed Stack Name to: " + stack_name)
exit(0)