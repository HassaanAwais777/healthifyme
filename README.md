## CORS Setup for Expo Go

The backend is configured to allow all origins with:

```
app.use(cors({
  origin: '*'
}));
```

This allows Expo Go devices on your network to access the API. If you want to restrict access, set `origin` to your phone's IP or subnet. 