# Quick Reference Card

## 🚀 **Getting Started**

### **Start Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### **Start Frontend:**
```bash
cd frontend
npm run dev
```

### **Run Tests:**
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### **Generate API Types:**
```bash
# Generate TypeScript types from OpenAPI
cd frontend
npx openapi-typescript http://localhost:8000/openapi.json -o src/api-types.ts

# Generate API client code
npx openapi-typescript-codegen --input http://localhost:8000/openapi.json --output src/api --client axios
```

**⚠️ Important:** Run these commands whenever you change Pydantic schemas in the backend to keep the TypeScript types in sync!

---

## 📝 **Common Tasks**

### **Update TODO:**
- Mark completed tasks with ✅
- Add notes about issues
- Plan next tasks

### **Ask for Help:**
- Use the help request template
- Include error messages
- Show relevant code

### **Code Review:**
- Use the code review template
- Explain what the code does
- Ask specific questions

---

## 🔧 **Development Commands**

### **Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Check code style
flake8
```

### **Frontend:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Check code style
npm run lint
```

---

## 📁 **Key Files**

### **Backend:**
- `backend/app/main.py` - Main application
- `backend/app/models.py` - Database models
- `backend/app/routers/` - API endpoints
- `backend/tests/` - Test files

### **Frontend:**
- `frontend/src/App.tsx` - Main app component
- `frontend/src/components/` - React components
- `frontend/src/hooks/` - Custom hooks
- `frontend/src/services/` - API services

### **Documentation:**
- `docs/TODO.md` - Development tasks
- `docs/forvarsmakten-game-detailed.md` - Game requirements
- `docs/development-workflow.md` - Workflow guidelines

---

## 🎯 **Current Phase: Phase 2**

### **Priority Tasks:**
1. ✅ All puzzle types implemented (memory, spatial, concentration, multitasking)
2. ✅ Frontend components created and integrated
3. ✅ Backend puzzle generation and validation
4. ✅ Complete game flow with all puzzle types
5. ✅ All tests passing

### **Success Criteria:**
- ✅ All puzzle types working correctly
- ✅ Frontend components properly styled and responsive
- ✅ Backend supports all puzzle types
- ✅ Game flow works with puzzle rotation
- ✅ All tests pass (59/59 tests passing)

---

## 📞 **Getting Help**

### **When Stuck:**
1. Check existing documentation
2. Look at similar code examples
3. Use the help request template
4. Ask specific questions

### **For Code Review:**
1. Use the code review template
2. Explain your approach
3. Ask about best practices
4. Request specific feedback

---

## 🎉 **Celebrating Progress**

### **Daily Wins:**
- Complete at least one task
- Fix any bugs encountered
- Test your changes
- Plan for tomorrow

### **Phase Milestones:**
- ✅ Phase 1: Basic game flow works
- ✅ Phase 2: All puzzle types implemented
- 🔄 Phase 3: UI matches design
- ⏳ Phase 4: Enhanced features added
- ⏳ Phase 5: Game is polished and tested 