import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server-side Gemini initialization as mandated by gemini-api skill
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface OrderItem {
  id: string;
  orderNumber: string;
  posterId: string;
  posterTitle: string;
  category: string;
  format: 'A4' | 'A3' | 'BACHE' | 'ROLLUP' | 'FLYER';
  paperType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE';
  paymentStatus: 'PAID' | 'PENDING';
  orderStatus: 'PENDING' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED';
  posterPreviewUrl?: string;
  notes?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
}

// In-memory store initialized with realistic orders for demonstration
let orders: OrderItem[] = [
  {
    id: 'ord-101',
    orderNumber: 'AP-2026-9042',
    posterId: 'tpl-eglise-1',
    posterTitle: 'Grande Nuit de Traversée & Prophétique',
    category: 'Église & Culte',
    format: 'BACHE',
    paperType: 'Bâche PVC 450g grand format avec œillets',
    quantity: 2,
    unitPrice: 8500,
    totalPrice: 17000,
    clientName: 'Pasteur Emmanuel Konan',
    clientPhone: '+225 07 48 29 11 02',
    clientEmail: 'eglise.grace@gmail.com',
    deliveryCity: 'Abidjan - Cocody Angré',
    deliveryAddress: 'Carrefour 8ème Tranche, près de la pharmacie du 22ème',
    paymentMethod: 'WAVE',
    paymentStatus: 'PAID',
    orderStatus: 'IN_PRODUCTION',
    notes: 'Bâche pour la façade principale de l’église. Finition renforcée.',
    createdAt: '2026-10-22T14:30:00Z',
    estimatedDeliveryDate: '2026-10-24',
  },
  {
    id: 'ord-102',
    orderNumber: 'AP-2026-8984',
    posterId: 'tpl-commerce-1',
    posterTitle: 'Grand Déstockage Vente Privée Chic',
    category: 'Commerce & Promo',
    format: 'A3',
    paperType: 'Papier Couché Brillant 350g',
    quantity: 25,
    unitPrice: 750,
    totalPrice: 18750,
    clientName: 'Awa Diop (Boutique Ivoire Elegance)',
    clientPhone: '+225 05 64 12 88 40',
    clientEmail: 'awa.ivoire@gmail.com',
    deliveryCity: 'Abidjan - Plateau',
    deliveryAddress: 'Avenue Chardy, Immeuble Alpha 2ème étage',
    paymentMethod: 'ORANGE_MONEY',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    notes: 'Affichage vitrines et commerces partenaires.',
    createdAt: '2026-10-21T09:15:00Z',
    estimatedDeliveryDate: '2026-10-23',
  },
  {
    id: 'ord-103',
    orderNumber: 'AP-2026-8850',
    posterId: 'tpl-resto-1',
    posterTitle: 'Soirée Grillades & Alloco Party VIP',
    category: 'Restaurant & Fast-Food',
    format: 'FLYER',
    paperType: 'Flyers A5 Couché 170g Recto/Verso',
    quantity: 200,
    unitPrice: 150,
    totalPrice: 30000,
    clientName: 'Yannick Bamba (Le Maquis Étoilé)',
    clientPhone: '+225 01 02 33 44 55',
    clientEmail: 'contact@maquisetoile.ci',
    deliveryCity: 'Abidjan - Yopougon',
    deliveryAddress: 'Rue Princesse, face complexe sportif',
    paymentMethod: 'MTN_MOMO',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    createdAt: '2026-10-19T11:00:00Z',
    estimatedDeliveryDate: '2026-10-21',
  },
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'AffichePro API',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      ordersCount: orders.length,
    });
  });

  // Get orders
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json({ success: true, orders });
  });

  // Create new order
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const data = req.body;
      const orderNumber = `AP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: OrderItem = {
        id: `ord-${Date.now()}`,
        orderNumber,
        posterId: data.posterId || 'custom-poster',
        posterTitle: data.posterTitle || 'Affiche Personnalisée',
        category: data.category || 'Général',
        format: data.format || 'A3',
        paperType: data.paperType || 'Papier Couché 350g',
        quantity: Number(data.quantity) || 1,
        unitPrice: Number(data.unitPrice) || 750,
        totalPrice: Number(data.totalPrice) || (Number(data.quantity) * Number(data.unitPrice)),
        clientName: data.clientName || 'Client AffichePro',
        clientPhone: data.clientPhone || '',
        clientEmail: data.clientEmail || '',
        deliveryCity: data.deliveryCity || 'Abidjan',
        deliveryAddress: data.deliveryAddress || '',
        paymentMethod: data.paymentMethod || 'WAVE',
        paymentStatus: 'PAID', // Simulated instant checkout
        orderStatus: 'PENDING',
        posterPreviewUrl: data.posterPreviewUrl,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      };

      orders.unshift(newOrder);
      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      console.error('Error creating order:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update order status (Admin)
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }
    orders[orderIndex].orderStatus = status;
    res.json({ success: true, order: orders[orderIndex] });
  });

  // AI Generation: Poster Copywriting / Redaction assistée
  app.post('/api/ai/generate-poster-content', async (req: Request, res: Response) => {
    const { theme, eventType, audience, tone, existingText } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if no API key is provided
      return res.json({
        success: true,
        source: 'smart-template-engine',
        data: generateFallbackContent(theme, eventType),
      });
    }

    try {
      const prompt = `Tu es le meilleur concepteur-rédacteur publicitaire et graphiste spécialisé dans la création d'affiches professionnelles percutantes pour l'Afrique de l'Ouest (Côte d'Ivoire, Sénégal, etc.) et les communautés francophones.
      
      Génère le contenu complet, accrocheur et prêt à l'emploi pour une affiche professionnelle basée sur la demande suivante:
      - Thématique / Sujet: "${theme || 'Événement spécial'}"
      - Type d'événement / Catégorie: "${eventType || 'Événement'}"
      - Public cible: "${audience || 'Grand public'}"
      - Tonalité: "${tone || 'Dynamique et prestigieux'}"
      ${existingText ? `- Éléments fournis par l'utilisateur: "${existingText}"` : ''}

      Fournis des textes percutants, chaleureux et professionnels (avec numéros WhatsApp réalistes pour la région ex: +225 07..., lieux réputés ou adaptés, dates claires).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Titre principal percutant et mémorable' },
              subtitle: { type: Type.STRING, description: 'Sous-titre explicatif ou slogan fort' },
              badge: { type: Type.STRING, description: 'Macaron accrocheur ex: ENTRÉE LIBRE, PROMO -40%, VENTE FLASH, SPÉCIAL CULTE' },
              date: { type: Type.STRING, description: 'Date formatée ex: Samedi 15 Novembre 2026' },
              time: { type: Type.STRING, description: 'Heure ex: À partir de 18h30' },
              location: { type: Type.STRING, description: 'Lieu précis ex: Palais de la Culture, Treichville / Espace Latrille Events' },
              contact: { type: Type.STRING, description: 'Contact et WhatsApp ex: Infoline & WhatsApp: +225 07 89 45 12' },
              organizer: { type: Type.STRING, description: 'Organisateur ou marque' },
              price: { type: Type.STRING, description: 'Tarif d\'entrée ou offre ex: Gratuit / 5 000 FCFA' },
              description: { type: Type.STRING, description: 'Courte phrase de présentation ou programme' },
              suggestedPalette: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING, description: 'Hex code couleur principale' },
                  secondary: { type: Type.STRING, description: 'Hex code couleur secondaire' },
                  accent: { type: Type.STRING, description: 'Hex code couleur accent' },
                  paletteName: { type: Type.STRING, description: 'Nom du thème de couleur suggéré' },
                },
                required: ['primary', 'secondary', 'accent', 'paletteName'],
              },
              imagePromptSuggestion: {
                type: Type.STRING,
                description: 'Prompt détaillé en anglais pour générer un visuel époustouflant adapté',
              },
            },
            required: [
              'title',
              'subtitle',
              'badge',
              'date',
              'time',
              'location',
              'contact',
              'organizer',
              'price',
              'description',
              'suggestedPalette',
              'imagePromptSuggestion',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
    } catch (err: any) {
      console.error('Gemini content generation error:', err);
      return res.json({
        success: true,
        source: 'smart-template-engine-fallback',
        data: generateFallbackContent(theme, eventType),
        warning: err.message,
      });
    }
  });

  // AI Generation: Image for Poster Visual
  app.post('/api/ai/generate-image', async (req: Request, res: Response) => {
    const { prompt, aspectRatio = '3:4', category = 'general' } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: `Professional poster photography, cinematic lighting, ultra-high resolution, vibrant, clean background suitable for graphic overlay: ${prompt}. No text in image.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '3:4',
            },
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              return res.json({
                success: true,
                source: 'gemini-3.1-flash-lite-image',
                imageUrl: `data:${mimeType};base64,${base64Data}`,
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('Gemini image generation attempt failed, using curated high-definition asset:', err.message);
      }
    }

    // High quality curated thematic image fallback based on category & prompt keywords
    const curatedImage = getCuratedThematicImage(prompt, category);
    return res.json({
      success: true,
      source: 'curated-hd-library',
      imageUrl: curatedImage,
    });
  });

  // AI Order Generator & Smart Estimator: "générer les commandes avec l'ia"
  app.post('/api/ai/recommend-order', async (req: Request, res: Response) => {
    const { posterTitle, category, eventDescription, expectedAudience, budget, city } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackRecommendation = calculateSmartOrder({
        category,
        expectedAudience,
        budget,
        posterTitle,
      });
      return res.json({ success: true, source: 'rule-engine', data: fallbackRecommendation });
    }

    try {
      const prompt = `Tu es le directeur de production d'une imprimerie moderne à Abidjan (AffichePro).
      Un client souhaite imprimer des affiches pour son projet:
      - Titre de l'affiche: "${posterTitle || 'Événement'}"
      - Catégorie: "${category || 'Général'}"
      - Description du projet: "${eventDescription || 'Campagne de communication'}"
      - Audience / Visibilité attendue: "${expectedAudience || 'Grand public'}"
      - Budget envisagé: "${budget || 'Standard'} FCFA"
      - Ville / Commune: "${city || 'Abidjan'}"

      Analyse ce projet et propose la recommandation idéale de commande d'impression (Format, Type de papier, Quantité recommandée, Finition, Justification professionnelle de l'imprimeur, et conseils pour maximiser l'impact visuel dans les rues et commerces).
      
      Grille tarifaire de référence (en FCFA):
      - A4 Couché 300g: 300 FCFA / unité (min 10)
      - A3 Couché 350g: 750 FCFA / unité
      - Bâche PVC 450g avec œillets: 8 500 FCFA / unité
      - Roll-up Pro Structure alu: 12 000 FCFA / unité
      - Flyers A5 170g: 150 FCFA / unité (min 100)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedFormat: {
                type: Type.STRING,
                description: 'Format recommandé: A4, A3, BACHE, ROLLUP ou FLYER',
              },
              paperType: { type: Type.STRING, description: 'Désignation exacte du papier et grammage' },
              recommendedQuantity: { type: Type.INTEGER, description: 'Quantité optimale conseillée' },
              unitPrice: { type: Type.INTEGER, description: 'Prix unitaire en FCFA' },
              totalPrice: { type: Type.INTEGER, description: 'Prix total calculé en FCFA' },
              expertReasoning: {
                type: Type.STRING,
                description: 'Explication professionnelle de l\'imprimeur sur pourquoi ce choix est le plus rentable et impactant',
              },
              displayAdvice: {
                type: Type.STRING,
                description: 'Conseils pratiques de pose et distribution (endroits stratégiques à Abidjan ou en ville)',
              },
              suggestedDeliveryTime: { type: Type.STRING, description: 'Délai d\'impression et livraison estimé' },
            },
            required: [
              'recommendedFormat',
              'paperType',
              'recommendedQuantity',
              'unitPrice',
              'totalPrice',
              'expertReasoning',
              'displayAdvice',
              'suggestedDeliveryTime',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
    } catch (err: any) {
      console.error('Gemini order recommendation error:', err);
      const fallbackRecommendation = calculateSmartOrder({
        category,
        expectedAudience,
        budget,
        posterTitle,
      });
      return res.json({ success: true, source: 'rule-engine-fallback', data: fallbackRecommendation });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AffichePro Server] Running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackContent(theme?: string, eventType?: string) {
  const t = (theme || '').toLowerCase();
  if (t.includes('eglise') || t.includes('culte') || t.includes('gospel') || t.includes('priere')) {
    return {
      title: 'GRANDE NUIT D\'IMPACT & MIRACLES',
      subtitle: 'Une rencontre divine pour transformer ta saison',
      badge: 'ENTRÉE LIBRE & GRATUITE',
      date: 'Vendredi 28 Novembre 2026',
      time: 'Dès 21h00 jusqu\'à l\'aube',
      location: 'Grand Temple Grâce Vivante - Abidjan Cocody Angré',
      contact: 'Infoline & WhatsApp: +225 07 48 00 12 34',
      organizer: 'Ministère International de la Grâce',
      price: 'Entrée Libre',
      description: 'Moments d\'adoration profonde, prières d\'intercession et révélation prophétique.',
      suggestedPalette: {
        primary: '#1e1b4b',
        secondary: '#f59e0b',
        accent: '#fbbf24',
        paletteName: 'Or & Majesté Royale',
      },
      imagePromptSuggestion: 'A warm golden light shining on a modern christian worship stage with silhouette hands lifted in praise, cinematic atmosphere',
    };
  }

  if (t.includes('promo') || t.includes('solde') || t.includes('boutique') || t.includes('commerce') || t.includes('vente')) {
    return {
      title: 'GRANDE VENTE PRIVÉE & DÉSTOCKAGE',
      subtitle: 'Jusqu\'à -60% sur toute la nouvelle collection',
      badge: 'OFFRE LIMITÉE 72H',
      date: 'Du 15 au 18 Novembre 2026',
      time: '09h00 - 20h00 non-stop',
      location: 'Showroom Ivoire Mode - Abidjan Plateau, Rue du Commerce',
      contact: 'WhatsApp Commandes: +225 05 67 89 10 11',
      organizer: 'Ivoire Fashion & Wax Luxe',
      price: 'Accès Libre',
      description: 'Tenues traditionnelles chic, prêt-à-porter moderne et accessoires en série limitée.',
      suggestedPalette: {
        primary: '#b91c1c',
        secondary: '#facc15',
        accent: '#ffffff',
        paletteName: 'Rouge Éclat & Or Vente',
      },
      imagePromptSuggestion: 'Elegant African fashion model wearing modern stylish clothing with vibrant fabric textures in a luxury boutique setting',
    };
  }

  if (t.includes('formation') || t.includes('seminaire') || t.includes('business') || t.includes('masterclass')) {
    return {
      title: 'MASTERCLASS BUSINESS & IA 2026',
      subtitle: 'Les stratégies concrètes pour doubler son chiffre d\'affaires',
      badge: 'CERTIFICAT INCLUS',
      date: 'Samedi 12 Décembre 2026',
      time: '09h00 - 16h00',
      location: 'Hôtel Tiama, Plateau - Salle des Ambassadeurs',
      contact: 'Inscriptions WhatsApp: +225 01 23 45 67 89',
      organizer: 'Académie Ouest-Africaine du Leadership',
      price: '25 000 FCFA (Pause-café incluse)',
      description: 'Études de cas réelles, networking avec des entrepreneurs à succès et boîte à outils pratique.',
      suggestedPalette: {
        primary: '#0f172a',
        secondary: '#06b6d4',
        accent: '#10b981',
        paletteName: 'Tech & Prestigieux Corporate',
      },
      imagePromptSuggestion: 'Modern business conference room with professional speaker presenting analytics on high-tech screen, clean corporate lighting',
    };
  }

  // Default event fallback
  return {
    title: 'GRAND ÉVÉNEMENT PRESTIGE 2026',
    subtitle: 'Une expérience inoubliable au cœur d\'Abidjan',
    badge: 'PLACES LIMITÉES',
    date: 'Samedi 20 Décembre 2026',
    time: 'À partir de 18h30',
    location: 'Palais de la Culture, Salle Anoumabo - Abidjan',
    contact: 'Infoline & Réservations: +225 07 00 11 22 33',
    organizer: 'AffichePro Événements',
    price: 'Standard: 5 000 FCFA | VIP: 15 000 FCFA',
    description: 'Performances en direct, invités d\'honneur et ambiance feutrée garantie.',
    suggestedPalette: {
      primary: '#09090b',
      secondary: '#e11d48',
      accent: '#f59e0b',
      paletteName: 'Élégance Sombre & Néon',
    },
    imagePromptSuggestion: 'Atmospheric stage lights, subtle smoke, spotlight on center stage, festival and celebration vibe',
  };
}

function calculateSmartOrder({ category, expectedAudience, budget, posterTitle }: any) {
  const cat = (category || '').toLowerCase();
  const numBudget = Number(budget) || 25000;

  if (cat.includes('eglise') || cat.includes('culte')) {
    return {
      recommendedFormat: 'BACHE',
      paperType: 'Bâche PVC 450g résistante pluie & UV avec œillets métalliques',
      recommendedQuantity: 2,
      unitPrice: 8500,
      totalPrice: 17000,
      expertReasoning:
        'Pour les églises et croisades, une bâche extérieure grand format (2m x 1.2m) offre une visibilité de plus de 50 mètres pour tous les fidèles et passants, réutilisable et résistante aux intempéries.',
      displayAdvice:
        'Accrochez une bâche sur le portail ou la façade de l\'église, et une seconde au carrefour principal le plus proche.',
      suggestedDeliveryTime: '24h à 48h ouvrées',
    };
  }

  if (cat.includes('resto') || cat.includes('soiree') || cat.includes('fast-food')) {
    return {
      recommendedFormat: 'FLYER',
      paperType: 'Flyers A5 Couché 170g recto-verso haute brillance',
      recommendedQuantity: 200,
      unitPrice: 150,
      totalPrice: 30000,
      expertReasoning:
        'Pour les restaurants et soirées, les flyers A5 distribués en main propre ou déposés sur les comptoirs génèrent un taux de passage immédiat très élevé.',
      displayAdvice:
        'Distribuez aux abords des centres d\'affaires entre 12h et 14h, et laissez des piles dans les commerces partenaires.',
      suggestedDeliveryTime: '48h ouvrées',
    };
  }

  // Default A3 poster campaign
  const qty = Math.max(10, Math.min(100, Math.floor(numBudget / 750)));
  return {
    recommendedFormat: 'A3',
    paperType: 'Affiche A3 Couché Brillant 350g haute tenue',
    recommendedQuantity: qty,
    unitPrice: 750,
    totalPrice: qty * 750,
    expertReasoning:
      'Le format A3 est le standard roi des affiches urbaines: visible de loin, économique et facile à punaiser ou coller dans les commerces, halls et points de passage stratégiques.',
    displayAdvice:
      'Ciblez les vitrines des commerces partenaires, les carrefours à fort trafic et les tableaux d\'affichage autorisés.',
    suggestedDeliveryTime: '24h à 48h ouvrées',
  };
}

function getCuratedThematicImage(prompt: string, category: string) {
  const p = (prompt + ' ' + category).toLowerCase();

  if (p.includes('eglise') || p.includes('church') || p.includes('gospel') || p.includes('worship') || p.includes('priere')) {
    return 'https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=1200&q=80';
  }
  if (p.includes('concert') || p.includes('musique') || p.includes('festival') || p.includes('night') || p.includes('soiree')) {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80';
  }
  if (p.includes('food') || p.includes('resto') || p.includes('grill') || p.includes('alloco') || p.includes('buffet')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80';
  }
  if (p.includes('fashion') || p.includes('mode') || p.includes('wax') || p.includes('shopping') || p.includes('promo')) {
    return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80';
  }
  if (p.includes('business') || p.includes('formation') || p.includes('conference') || p.includes('seminaire')) {
    return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80';
  }
  if (p.includes('anniversaire') || p.includes('birthday') || p.includes('fete')) {
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
  }

  // Fallback high quality stage / dynamic lighting
  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
}

startServer();
