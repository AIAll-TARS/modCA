# A777 Developer Documentation (Updated: Personal AI Assistant Architecture)

This document explains everything needed to build, run, extend, and deploy A777 — a personal AI assistant/second brain focused on knowledge management, recall functionality, and personal productivity with actions for Chat, Google Calendar, Notion, durable Memory, and Chrome History access.

---

## 0. TL;DR
- **Purpose**: Personal AI companion for knowledge management and recall - a digital extension of cognitive processes
- **Architecture**: Single-user, portable, local-first design optimized for personalization and VM portability
- **Stack**: Python 3.11+, FastAPI, httpx, Pydantic v2, SQLite (WAL), optional Redis, optional Chroma; Next.js UI  
- **LLMs**: OpenAI/Azure (OpenAI-compatible), Local via Ollama; optional LiteLLM proxy  
- **Actions**: Google Calendar, Notion, Filesystem, Memory (`remember/recall/forget/pin`), **Chrome History**  
- **Memory**: Hybrid retrieval (FTS5 + embeddings) with privacy controls and personalization learning
- **Security**: Bitwarden CLI integration for credential management
- **Deployment**: Docker containerization for easy VM transfers
- **Run**: `uvicorn app.main:app --reload` and `pnpm dev`

---

## 1. Architecture Philosophy

### Core Design Principles
- **Personal-First**: Single-user optimization, not scalable for multiple users
- **Portable**: Easy transfer between local machines and VMs
- **Evolutionary**: Modular architecture for future API integrations and learning
- **Local-First**: Data stays local, credentials in secure vault
- **Personalizable**: Adapts to user's thinking patterns and preferences over time

### Architecture Overview
```
a777/                        # Portable deployment structure
├── docker-compose.yml       # Single-command deployment
├── data/                    # Core persistent data
│   ├── a777.db            # SQLite database
│   ├── embeddings/        # Vector embeddings
│   └── memory/            # User memory and preferences
├── config/
│   ├── .env.template      # Environment template
│   └── credentials.enc    # Encrypted credential vault
└── scripts/
    ├── backup.sh          # Full system backup
    ├── restore.sh         # System restoration
    └── migrate.sh         # VM transfer script

frontend/                    # Next.js + Tailwind + shadcn/ui
├── app/
├── components/
└── lib/

app/                         # Python FastAPI backend
├── main.py
├── llm/
│   ├── provider_openai.py
│   ├── provider_ollama.py
│   ├── router.py
│   └── prompts.py          # Customizable reasoning patterns
├── tools/                   # Modular tool system
│   ├── base.py             # Tool interface definitions
│   ├── registry.py         # Dynamic tool discovery
│   ├── google_calendar.py
│   ├── notion.py
│   ├── filesystem.py
│   ├── memory.py
│   └── chrome_history.py
├── memory/
│   ├── store.py            # Hybrid memory management
│   ├── embed.py            # Embedding generation
│   └── schema.sql          # Versioned schema
├── auth/
│   ├── google_oauth.py
│   ├── session.py
│   └── bitwarden_cli.py    # Credential management
├── db/
│   ├── sqlite.py
│   └── migrations/
├── schemas.py
└── util/
    ├── logging.py
    ├── errors.py
    └── time.py

scripts/                     # Maintenance and utilities
├── reembed.py
├── import_history.py
├── backup.py
└── migrate.py
```

---

## 2. Personal AI Companion Features

### Knowledge Management
- **Cross-platform memory**: Chrome history + Notion + Calendar + filesystem unified search
- **Temporal context**: "What was I researching last Tuesday?"
- **Semantic search**: FTS5 + embeddings for both exact and fuzzy matching
- **Personal learning**: Adapts to user's communication style and preferences

### Second Brain Capabilities
- **Research journey tracking**: Chrome history captures exploration, not just destinations
- **Memory persistence**: Context maintained across conversations
- **Tool composability**: Chain actions across different services
- **Reasoning pattern transfer**: Customizable AI behavior matching user's thinking style

---

## 3. Local Environment & Setup

### Prerequisites
- Python 3.11+, Node 20+, pnpm
- Docker & Docker Compose
- Chrome installed (history DB readable)
- Bitwarden account and CLI (`bw` command)

### Setup
```bash
# Clone and setup
git clone <repo>
cd a777

# Docker deployment (recommended)
docker-compose up -d

# Or manual setup
uv venv
uv pip install -r requirements.txt
cd frontend && pnpm install
cp .env.example .env
```

### Bitwarden Integration
```bash
# Install Bitwarden CLI
npm install -g @bitwarden/cli

# Login once
bw login

# Create A777 credential entries:
# - a777-openai-api-key
# - a777-google-oauth-secret  
# - a777-notion-token
# - a777-chrome-profile-path
```

---

## 4. Environment Configuration

### .env Template (Updated for Bitwarden)
```
A777_ENV=dev
TZ=Europe/Warsaw
LOG_LEVEL=INFO

# LLM Configuration
LLM_PROVIDER=openai            # openai|ollama|litellm
OPENAI_API_KEY=bitwarden:a777-openai-api-key
OPENAI_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

OLLAMA_BASE=http://localhost:11434
OLLAMA_MODEL=llama3:instruct

# Database
SQLITE_PATH=/data/a777.db
EMBEDDING_BACKEND=local        # local|openai
EMBEDDING_MODEL=bge-m3

# OAuth (via Bitwarden)
GOOGLE_CLIENT_ID=bitwarden:a777-google-client-id
GOOGLE_CLIENT_SECRET=bitwarden:a777-google-client-secret
OAUTH_REDIRECT_URL=http://localhost:8000/auth/google/callback

# External Services (via Bitwarden)
NOTION_TOKEN=bitwarden:a777-notion-token

# Chrome History Access
CHROME_PROFILE_PATH_WINDOWS=bitwarden:a777-chrome-profile-windows
CHROME_PROFILE_PATH_MAC=bitwarden:a777-chrome-profile-mac
CHROME_PROFILE_PATH_LINUX=bitwarden:a777-chrome-profile-linux
CHROME_HISTORY_ENABLED=true

# Personalization
PERSONALIZATION_ENABLED=true
LEARNING_MODE=true
REASONING_STYLE=structured_first_principles
```

---

## 5. Portable Deployment

### VM Transfer Workflow
```bash
# 1. Backup current instance
./scripts/backup.sh

# 2. Transfer to new VM
scp a777-backup-*.tar.gz user@new-vm:/home/user/

# 3. Restore on new VM
tar -xzf a777-backup-*.tar.gz
docker-compose up -d

# 4. Update VM-specific configs
# Edit .env for new IPs/paths if needed
```

### Data Separation Strategy
- **Core data**: SQLite DB, embeddings, user preferences (portable)
- **Credentials**: Bitwarden vault (cloud-synced, secure)
- **Cache/temp**: Regenerated on startup
- **Logs**: Optional retention, not critical for portability

---

## 6. Evolutionary Architecture

### Tool System Flexibility
- **Plugin architecture**: Easy add/remove tools via registry
- **Generic API connectors**: Reusable patterns for new services
- **Version management**: Tools can be versioned and A/B tested
- **Graceful degradation**: System continues if individual tools fail

### Future Integration Patterns
- **Runtime configuration**: Update tools without restart
- **Feature flags**: Enable experimental features
- **Usage monitoring**: Track which tools/features are actually used
- **Composable primitives**: Build complex workflows from simple tools

### Memory Evolution
- **Schema migrations**: Versioned database schema updates
- **Embedding model updates**: Switch embedding models over time
- **Retrieval strategy learning**: Improve search based on usage patterns
- **Memory pruning**: Archive old memories while preserving access

---

## 7. Security & Privacy

### Credential Management
- **Zero plaintext**: All credentials via Bitwarden CLI
- **Audit trail**: Track credential access
- **Easy rotation**: Update credentials in Bitwarden, restart services
- **Local encryption**: Optional local credential encryption for offline use

### Privacy Controls
- **Explicit opt-in**: Chrome history requires explicit enablement
- **Data retention**: Configurable memory retention policies
- **Export capability**: Full data export for user control
- **Local processing**: Sensitive data never leaves local machine

---

## 8. Development & Maintenance

### Adding New Tools
```python
# 1. Create tool class
class NewServiceTool(BaseTool):
    def __init__(self):
        self.name = "new_service"
        self.credential_key = "bitwarden:a777-new-service-token"
    
    def execute(self, action, params):
        # Implementation
        pass

# 2. Register in tools/registry.py
# 3. Add credential to Bitwarden
# 4. Update .env template
```

### Monitoring & Analytics
- **Usage patterns**: Which tools/features are used most
- **Performance metrics**: Response times, memory usage
- **Error tracking**: Failed operations and recovery
- **Learning progress**: How personalization improves over time

---

## 9. Next Steps

### Immediate Priorities
1. **Bitwarden CLI integration**: Implement credential fetching
2. **Docker containerization**: Complete portable deployment
3. **Backup/restore scripts**: Automated VM transfer
4. **Personalization framework**: User preference learning

### Future Enhancements
1. **Advanced memory management**: Smart pruning and archiving
2. **Custom reasoning patterns**: User-specific AI behavior
3. **API marketplace**: Community tool sharing
4. **Advanced analytics**: Deep insights into knowledge patterns

---

*This documentation reflects the personal AI companion vision - a tool that grows and adapts with you, becoming a true extension of your cognitive processes while maintaining complete privacy and portability.*