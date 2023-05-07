from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode

error_code_dic = {}
for error_code in MkdiErrorCode:
    error_code_dic[error_code.name] = error_code.value
