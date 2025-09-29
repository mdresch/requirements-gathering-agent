# 🚀 **Quick Reference Guide**

## 📋 **Phase Overview**

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **Phase 1** | 2-4 weeks | Foundation | Schemas, Security, Consistency |
| **Phase 2** | 4-6 weeks | Structure | Routes, Validation, Auth |
| **Phase 3** | 4-6 weeks | Optimization | Caching, Docker, Config |

---

## 🎯 **Phase 1: Foundation (2-4 weeks)**

### **1. Mongoose Schemas** 🔥 HIGH
```bash
# Install dependencies
npm install mongoose

# Create structure
mkdir -p src/models
touch src/models/{Template,Project,Feedback,Category,AuditTrail,Stakeholder,UserSession}.model.ts
touch src/models/index.ts
```

**Key Files:**
- `src/models/Template.model.ts` - Enhance existing
- `src/models/Project.model.ts` - Create new
- `src/models/index.ts` - Export all models

**Success Criteria:**
- [ ] All collections have proper schemas
- [ ] TypeScript compilation passes
- [ ] Validation enforced at schema level

### **2. Input Sanitization** 🔥 HIGH
```bash
# Install dependencies
npm install express-validator express-sanitizer helmet
npm install --save-dev @types/express-validator
```

**Key Files:**
- `src/middleware/sanitization.ts` - Sanitization middleware
- Update all POST/PUT endpoints with validation

**Success Criteria:**
- [ ] All user input sanitized
- [ ] Validation rules applied
- [ ] NoSQL injection prevention

### **3. ID Consistency** 🔥 HIGH
```bash
# Create utility
touch src/utils/idUtils.ts
```

**Key Files:**
- `src/utils/idUtils.ts` - ID handling utilities
- Update all endpoints to use consistent ID handling

**Success Criteria:**
- [ ] Consistent `_id` handling
- [ ] Both `_id` and `id` in responses
- [ ] ObjectId validation applied

---

## 🏗️ **Phase 2: Structure (4-6 weeks)**

### **4. Route Splitting** 🔥 HIGH
```bash
# Create structure
mkdir -p src/routes
touch src/routes/{templates,projects,feedback,categories,auditTrail,dataQuality,realTimeActivity,stakeholders,analytics,health}.ts
touch src/routes/index.ts
```

**Key Files:**
- `src/routes/templates.ts` - Extract template routes
- `src/routes/index.ts` - Main router
- Update `simple-server.ts` to use routes

**Success Criteria:**
- [ ] Server file <500 lines
- [ ] Routes properly separated
- [ ] No functionality lost

### **5. Validation Library** 🔥 HIGH
```bash
# Install dependencies
npm install joi express-validator
npm install --save-dev @types/joi
```

**Key Files:**
- `src/validation/schemas.ts` - Joi validation schemas
- `src/middleware/validation.ts` - Validation middleware
- Apply to all endpoints

**Success Criteria:**
- [ ] All endpoints validated
- [ ] Consistent error messages
- [ ] Better data integrity

### **6. Authentication** 🔥 HIGH
```bash
# Install dependencies
npm install jsonwebtoken bcryptjs passport passport-jwt passport-local
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/passport @types/passport-jwt @types/passport-local
```

**Key Files:**
- `src/models/User.model.ts` - User schema
- `src/middleware/auth.ts` - Authentication middleware
- `src/routes/auth.ts` - Authentication routes

**Success Criteria:**
- [ ] User registration/login working
- [ ] JWT tokens generated/validated
- [ ] Protected routes require auth
- [ ] Role-based access control

---

## ⚡ **Phase 3: Optimization (4-6 weeks)**

### **7. Caching (Redis)** 🟡 MEDIUM
```bash
# Install dependencies
npm install redis ioredis
npm install --save-dev @types/redis
```

**Key Files:**
- `src/services/RedisService.ts` - Redis service
- `src/middleware/cache.ts` - Caching middleware
- `src/services/CacheInvalidationService.ts` - Cache invalidation

**Success Criteria:**
- [ ] Redis connection stable
- [ ] Caching middleware applied
- [ ] Cache invalidation working
- [ ] Performance improvement measurable

### **8. Dockerization** 🟡 MEDIUM
```bash
# Create files
touch Dockerfile
touch docker-compose.yml
touch docker-compose.prod.yml
touch nginx.conf
```

**Key Files:**
- `Dockerfile` - Application container
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `nginx.conf` - Reverse proxy

**Success Criteria:**
- [ ] Container builds successfully
- [ ] All services communicate
- [ ] Health checks working
- [ ] Production deployment ready

### **9. Environment Config** 🟠 LOW
```bash
# Install dependencies
npm install config
npm install --save-dev @types/config

# Create structure
mkdir -p config
touch config/{default,development,staging,production,test}.json
```

**Key Files:**
- `config/default.json` - Default configuration
- `config/production.json` - Production configuration
- `src/config/index.ts` - Configuration service

**Success Criteria:**
- [ ] Configuration files created
- [ ] Validation working
- [ ] Environment-specific settings
- [ ] Secure configuration handling

---

## 🛠️ **Common Commands**

### **Development**
```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Build
npm run build
```

### **Docker**
```bash
# Build image
docker build -t requirements-gathering-agent .

# Run development environment
docker-compose up --build

# Run production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f app
```

### **Database**
```bash
# Connect to MongoDB
mongosh "mongodb+srv://cluster.mongodb.net/database"

# Connect to Redis
redis-cli -h localhost -p 6379
```

---

## 📊 **Progress Tracking**

### **Phase 1 Checklist**
- [ ] Mongoose schemas implemented
- [ ] Input sanitization working
- [ ] ID consistency applied
- [ ] All tests passing
- [ ] Documentation updated

### **Phase 2 Checklist**
- [ ] Routes properly split
- [ ] Validation library integrated
- [ ] Authentication implemented
- [ ] All endpoints protected
- [ ] Role-based access working

### **Phase 3 Checklist**
- [ ] Redis caching operational
- [ ] Docker containers working
- [ ] Environment config applied
- [ ] Performance optimized
- [ ] Production deployment ready

---

## 🚨 **Troubleshooting**

### **Common Issues**

**TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
npm run type-check
```

**MongoDB Connection**
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error);"
```

**Redis Connection**
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
docker-compose logs redis
```

**Docker Issues**
```bash
# Clean Docker
docker system prune -f

# Rebuild containers
docker-compose down
docker-compose up --build
```

---

## 📞 **Support**

### **Documentation**
- [Phase 1: Foundation](./PHASE-1-FOUNDATION.md)
- [Phase 2: Structure](./PHASE-2-STRUCTURE.md)
- [Phase 3: Optimization](./PHASE-3-OPTIMIZATION.md)

### **Resources**
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Docker Documentation](https://docs.docker.com/)
- [Redis Documentation](https://redis.io/documentation)

---

## 🎯 **Success Metrics**

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| TypeScript Errors | 0 ✅ | 0 | 1 |
| Server File Size | 3,635 lines | <500 lines | 2 |
| Response Time | ~300ms | <200ms | 3 |
| Cache Hit Ratio | 0% | >80% | 3 |
| Test Coverage | ~60% | >80% | All |

---

**Ready to start? Begin with [Phase 1: Foundation](./PHASE-1-FOUNDATION.md)!** 🚀
