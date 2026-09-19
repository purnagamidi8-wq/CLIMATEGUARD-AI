import chromadb
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.core.config import settings

SEED_DOCUMENTS = [
    {"id": "flood_en_1", "content": "During floods: Move to higher ground immediately. Never walk or drive through flood waters. 15 cm of moving water can knock you down. 60 cm can carry a vehicle. Turn around, don't drown. Keep important documents in waterproof bags. Store clean drinking water. Keep emergency numbers saved. Follow IMD and NDMA warnings.", "hazard": "flood", "language": "en", "source": "NDMA India Flood Safety Guidelines", "profile": "general"},
    {"id": "flood_en_2", "content": "Flood preparedness checklist: Charge mobile phones. Store 3 days of drinking water. Keep torches with batteries. Protect important documents. Keep medicines accessible. Know your evacuation route. Monitor weather forecasts. Have emergency contacts ready. Keep first aid kit prepared.", "hazard": "flood", "language": "en", "source": "Indian Red Cross Flood Preparedness", "profile": "general"},
    {"id": "flood_te_1", "content": "వరదల సమయంలో: వెంటనే ఎత్తైన ప్రాంతానికి వెళ్ళండి. వరద నీటిలో ఎప్పుడూ నడవకండి లేదా డ్రైవ్ చేయకండి. ముఖ్యమైన పత్రాలను వాటర్‌ప్రూఫ్ బ్యాగ్‌లలో ఉంచండి. మందులు అందుబాటులో ఉంచుకోండి. IMD హెచ్చరికలను అనుసరించండి.", "hazard": "flood", "language": "te", "source": "NDMA India - Telugu Translation", "profile": "general"},
    {"id": "flood_hi_1", "content": "बाढ़ के दौरान: तुरंत ऊंचे स्थान पर जाएं। बाढ़ के पानी में कभी न चलें या गाड़ी न चलाएं। महत्वपूर्ण दस्तावेजों को वाटरप्रूफ बैग में रखें। दवाइयां सुलभ रखें। IMD और NDMA की चेतावनियों का पालन करें।", "hazard": "flood", "language": "hi", "source": "NDMA India - Hindi Translation", "profile": "general"},
    {"id": "heat_en_1", "content": "Heatwave safety: Stay hydrated by drinking water regularly even if not thirsty. Avoid outdoor exposure between 11 AM and 4 PM. Wear light, loose cotton clothing. Use ORS if dehydrated. Check on elderly neighbors. Never leave children or pets in parked vehicles. Use wet towels for cooling. Seek immediate medical help for heatstroke symptoms like confusion, rapid heartbeat, or loss of consciousness.", "hazard": "heatwave", "language": "en", "source": "IMD Heat Action Plan Guidelines", "profile": "general"},
    {"id": "heat_te_1", "content": "వేడిగాలుల సమయంలో: దాహం లేకపోయినా క్రమం తప్పకుండా నీరు త్రాగండి. ఉదయం 11 నుండి సాయంత్రం 4 గంటల మధ్య బయటికి వెళ్ళడం మానుకోండి. తేలికపాటి, వదులుగా ఉండే బట్టలు ధరించండి. వృద్ధులను తనిఖీ చేయండి.", "hazard": "heatwave", "language": "te", "source": "IMD Heat Action Plan - Telugu", "profile": "general"},
    {"id": "cyclone_en_1", "content": "Cyclone preparedness: Secure loose objects outdoors. Board up windows. Charge all devices and power banks. Stock water, food, medicines for 3 days. Keep emergency kit ready with torch, radio, first aid. Stay indoors away from windows during the storm. Do not go outside during the eye of the cyclone. Follow official evacuation orders. After the storm, beware of fallen power lines and contaminated water.", "hazard": "cyclone", "language": "en", "source": "NDMA Cyclone Preparedness Guidelines", "profile": "general"},
    {"id": "lightning_en_1", "content": "Lightning safety: When thunder roars, go indoors. Avoid open fields, hilltops, isolated trees. Stay away from water bodies. Do not use landline phones. Wait 30 minutes after last thunder. Avoid metal objects. If caught outside, crouch low with feet together. Lightning kills more people in India than any other natural disaster.", "hazard": "lightning", "language": "en", "source": "IMD Lightning Safety Guidelines", "profile": "general"},
    {"id": "drought_en_1", "content": "Drought preparedness: Conserve water at home - fix leaks, reduce usage. Use drip irrigation for farming. Choose drought-resistant crop varieties. Mulch soil to reduce evaporation. Harvest rainwater. Monitor soil moisture. Follow water rationing guidelines. Report water wastage. Store emergency drinking water.", "hazard": "drought", "language": "en", "source": "NDMA Drought Management Guidelines", "profile": "general"},
    {"id": "wildfire_en_1", "content": "Wildfire safety: Create defensible space around buildings. Clear dry vegetation within 30 feet of structures. Have an evacuation bag ready. Know your escape routes. Monitor fire weather conditions. Close windows during smoke events. Use N95 masks when air quality is poor. Follow fire department evacuation orders immediately.", "hazard": "wildfire", "language": "en", "source": "NDMA Wildfire Safety Guidelines", "profile": "general"},
    {"id": "farmer_flood_en", "content": "Farmer flood advisory: Monitor drainage channels and clear blockages before monsoon. Move livestock to higher ground. Protect stored grain with plastic sheeting. Avoid working near swollen rivers. Follow district agricultural office advisories. Delay sowing if heavy rains are forecast. Consider crop insurance for flood-prone areas.", "hazard": "flood", "language": "en", "source": "Indian Council of Agricultural Research", "profile": "farmer"},
    {"id": "farmer_heat_en", "content": "Farmer heat advisory: Schedule field work for early morning before 10 AM or after 5 PM. Ensure adequate water for livestock. Use shade nets for nurseries. Apply mulch to retain soil moisture. Irrigate during cooler hours. Watch for heat stress signs in animals. Follow Kisan Call Center (1551) advisories.", "hazard": "heatwave", "language": "en", "source": "Indian Council of Agricultural Research", "profile": "farmer"},
]

class RAGVectorStore:
    """ChromaDB-based vector store for climate safety knowledge base."""

    def __init__(self):
        self.client = None
        self.collection = None

    def initialize(self):
        persist_dir = settings.CHROMA_PERSIST_DIR
        Path(persist_dir).mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name="climate_safety_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        if self.collection.count() == 0:
            self._seed_knowledge()
        print(f"RAG Vector Store initialized with {self.collection.count()} documents.")

    def _seed_knowledge(self):
        ids = [d["id"] for d in SEED_DOCUMENTS]
        documents = [d["content"] for d in SEED_DOCUMENTS]
        metadatas = [{"hazard": d["hazard"], "language": d["language"], "source": d["source"], "profile": d.get("profile", "general")} for d in SEED_DOCUMENTS]
        self.collection.add(documents=documents, metadatas=metadatas, ids=ids)
        print(f"Seeded {len(ids)} knowledge documents into ChromaDB.")

    def search(self, query: str, hazard: Optional[str] = None, language: Optional[str] = None, n_results: int = 3) -> List[Dict[str, Any]]:
        if not self.collection:
            return []
        where_filters = {}
        if hazard:
            where_filters["hazard"] = hazard
        if language:
            where_filters["language"] = language

        where = where_filters if len(where_filters) == 1 else ({"$and": [{k: v} for k, v in where_filters.items()]} if where_filters else None)

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where
        )
        contexts = []
        if results and results.get("documents"):
            for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
                contexts.append({"content": doc, "source": meta.get("source", "Unknown"), "hazard": meta.get("hazard"), "language": meta.get("language"), "relevance": round(1 - dist, 3)})
        return contexts

    def add_document(self, doc_id: str, content: str, hazard: str, language: str = "en", source: str = "User Upload") -> bool:
        try:
            self.collection.add(documents=[content], metadatas=[{"hazard": hazard, "language": language, "source": source}], ids=[doc_id])
            return True
        except Exception as e:
            print(f"Error adding document: {e}")
            return False

rag_store = RAGVectorStore()
