import sys
import requests

#*  read content

file = open(sys.argv[3], 'r')
contents = file.read()

language = sys.argv[1]
ext = sys.argv[2]

#*  replace space/ tabs, *

contents = contents.replace("\\n", "")
contents = contents.replace("\n", "\\n")
contents = contents.replace("\t", "\\t")
contents = contents.replace("\"", "\\\"")

#*  build curl command parameters

headers = {
    'X-Access-Token': 'my-token',
    'Content-type': 'application/json',
}

image = language

if (image == "c"):
    image = image + "lang" 

data = '{\"image\": \"glot/' + image + ':latest\", \"payload\": {\"language\": \"' + language + '\", \"files\": [{\"name\": \"main.' + ext + '\", \"content\":'
data = data + "\"" + contents + "\"}]}}"

response = requests.post('http://20.113.87.37:8088/run', headers=headers, data=data)

#*  get response

print(response.content)