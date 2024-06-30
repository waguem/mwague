current_path=$(pwd)
api_path=../backend/openapi.json
output_path=../gen/python-client
openapi-generator generate -i "${api_path}" -g python -o ${output_path} --package-name client
# build the client
cd ${output_path}
python3 setup.py install --user
