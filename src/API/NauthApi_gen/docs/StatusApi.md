# StatusApi

All URIs are relative to _http://localhost_

| Method                      | HTTP request    | Description |
| --------------------------- | --------------- | ----------- |
| [**statusGet**](#statusget) | **GET** /Status |             |

# **statusGet**

> StringResponseWrapper statusGet()

### Example

```typescript
import { StatusApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new StatusApi(configuration);

const { status, data } = await apiInstance.statusGet();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**StringResponseWrapper**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain, application/json, text/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
