# leftovers

CS180 - Leftovers

# Expo starter

A plain project with the usual suspects set up:

- Expo Router
- Nativewind
- ESLint & Prettier
- TypeScript

# To Use

- Download the Expo Go App
- Run `npm run start`
- Scan the QR code to see on mobile

## AWS Configuration

### Database Connection
- **Host**: `rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Connection String**: 
```
  postgresql://postgres:RateApp2024!@rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com:5432/postgres
```

### S3 Bucket (Image Storage)
- **Bucket Name**: `rateapp-images-2025`
- **Region**: `us-east-2`
- **URL Format**: `https://rateapp-images-2025.s3.us-east-2.amazonaws.com/[filename]`

### EC2 Server
- **Public IP**: `52.15.240.106`
- **SSH Access**: 
```bash
  ssh -i "rate-key-pair.pem" ec2-user@52.15.240.106
```

### Testing Database Connection
```bash
# From EC2
psql -h rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com -p 5432 -U postgres

# Test connectivity
nc -zv rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com 5432
```
