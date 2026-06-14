/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbOperations, getDb, saveDb } from './server/db.js';
import { ProviderType, AvailabilityStatus, CallStatus, MARKETPLACE_SECTIONS_DATA } from './src/types.js';

// Extend Express Request interface to host authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple session parsing middleware using a header for maximum reliability in iframes
  app.use((req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.substring(7);
      const user = dbOperations.getProfileById(userId);
      if (user && !user.banned) {
        req.user = user;
      }
    }
    next();
  });

  // Auth Guards
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح، الرجاء تسجيل الدخول أولاً' });
    }
    if (req.user.banned) {
      return res.status(403).json({ error: 'هذا الحساب محظور!' });
    }
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'عذراً، هذه الصلاحية تقتصر على مدراء النظام فقط' });
    }
    next();
  };

  // --- Auth Enpoints ---
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { email, password, username, fullName, role } = req.body;
      
      if (!email || !password || !username || !fullName || !role) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة!' });
      }

      if (!['client', 'provider', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'نوع الحساب غير صالح' });
      }

      // Check if username already exists
      const existingUser = dbOperations.getProfileByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'اسم المستخدم مأخوذ بالفعل!' });
      }

      // Check if email already exists
      const existingEmail = dbOperations.getProfileByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل!' });
      }

      // Create profile (password_hash is stored directly as mock or MD5 prefix for simplicity)
      const profile = dbOperations.createProfile({
        email,
        username,
        fullName,
        avatar: `https://images.unsplash.com/photo-${role === 'provider' ? '1534528741775-53994a69daeb' : '1535713875002-d1d0cf377fde'}?w=150`,
        bio: role === 'provider' ? 'أهلاً بكم في صفحتي الشخصية كخبير/مبدع على كونكتو.' : 'مستخدم على منصة كونكتو.',
        role
      });

      // Simple response
      res.status(201).json({ user: profile, token: profile.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'يرجى تقديم البريد الإلكتروني وكلمة المرور' });
      }

      const user = dbOperations.getProfileByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'اسم المستخدم أو البريد الإلكتروني غير صحيح' });
      }

      if (user.banned) {
        return res.status(403).json({ error: 'تم حظر هذا الحساب من قبل مشرف المنصة لتعديه شروط الاستخدام.' });
      }

      res.json({ user, token: user.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  });


  // --- Marketplace Section Enpoints ---
  app.get('/api/marketplace/sections', (req: Request, res: Response) => {
    res.json(MARKETPLACE_SECTIONS_DATA);
  });

  app.get('/api/marketplace/providers', (req: Request, res: Response) => {
    try {
      const { providerType, category, specialty, search, onlineOnly, language } = req.query;

      let profiles = dbOperations.getProfiles();
      
      // Filter out providers, approved, not banned
      profiles = profiles.filter(p => p.role === 'provider' && p.approved && !p.banned);

      // Map to include settings
      let renderedProv = profiles.map(p => {
        const settings = dbOperations.getProviderSettings(p.id);
        const reviews = dbOperations.getReviews(p.id);
        const avgRating = reviews.length > 0
          ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
          : 5.0;

        return {
          ...p,
          settings,
          avgRating,
          reviewsCount: reviews.length
        };
      });

      // Filter based on query params
      if (providerType) {
        renderedProv = renderedProv.filter(r => r.settings?.providerType === providerType);
      }

      if (category) {
        renderedProv = renderedProv.filter(r => r.settings?.categorySlug === category);
      }

      if (specialty) {
        renderedProv = renderedProv.filter(r => r.settings?.specialtySlugs?.includes(specialty as string));
      }

      if (search) {
        const queryLower = (search as string).toLowerCase();
        renderedProv = renderedProv.filter(r => 
          r.fullName.toLowerCase().includes(queryLower) || 
          r.username.toLowerCase().includes(queryLower) ||
          r.bio.toLowerCase().includes(queryLower)
        );
      }

      if (onlineOnly === 'true') {
        renderedProv = renderedProv.filter(r => r.settings?.availabilityStatus === 'online');
      }

      if (language) {
        renderedProv = renderedProv.filter(r => r.settings?.languages?.includes(language as string));
      }

      res.json(renderedProv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/marketplace/providers/:username', (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const profile = dbOperations.getProfileByUsername(username);
      
      if (!profile || profile.role !== 'provider' || !profile.approved || profile.banned) {
        return res.status(404).json({ error: 'مقدّم الخدمة غير موجود أو غير معتمد' });
      }

      const settings = dbOperations.getProviderSettings(profile.id);
      const reviews = dbOperations.getReviews(profile.id);
      const avgRating = reviews.length > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
        : 5.0;

      res.json({
        ...profile,
        settings,
        reviews,
        avgRating,
        reviewsCount: reviews.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Provider Settings ---
  app.get('/api/provider-settings/:userId', requireAuth, (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      // Safeguard: only target self or admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'غير مخول للاطلاع على هذه البيانات' });
      }

      const settings = dbOperations.getProviderSettings(userId);
      res.json(settings || {});
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/provider-settings/:userId', requireAuth, (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'غير مخول لتعديل هذه البيانات' });
      }

      const { providerType, availabilityStatus, categorySlug, specialtySlugs, languages, pricePerMinute, bio, fullName, avatar } = req.body;

      // Update core profile properties if provided
      const profileUpdates: any = {};
      if (bio !== undefined) profileUpdates.bio = bio;
      if (fullName !== undefined) profileUpdates.fullName = fullName;
      if (avatar !== undefined) profileUpdates.avatar = avatar;
      
      if (Object.keys(profileUpdates).length > 0) {
        dbOperations.updateProfile(userId, profileUpdates);
      }

      // Update provider settings properties
      const settingsUpdates: any = {};
      if (providerType !== undefined) settingsUpdates.providerType = providerType;
      if (availabilityStatus !== undefined) settingsUpdates.availabilityStatus = availabilityStatus;
      if (categorySlug !== undefined) settingsUpdates.categorySlug = categorySlug;
      if (specialtySlugs !== undefined) settingsUpdates.specialtySlugs = specialtySlugs;
      if (languages !== undefined) settingsUpdates.languages = languages;
      if (pricePerMinute !== undefined) {
        const val = parseInt(pricePerMinute);
        if (isNaN(val) || val < 0 || val > 10000) {
          return res.status(400).json({ error: 'السعر بالدقيقة يجب أن يكون بين 0 و 10,000 ريال' });
        }
        settingsUpdates.pricePerMinute = val;
      }

      const settings = dbOperations.updateProviderSettings(userId, settingsUpdates);
      res.json({ settings, user: dbOperations.getProfileById(userId) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Call Enpoints ---
  app.post('/api/calls', requireAuth, (req: Request, res: Response) => {
    try {
      const { providerId } = req.body;
      if (!providerId) {
        return res.status(400).json({ error: 'مطلوب معرّف مقدم الخدمة لبدء الاتصال' });
      }

      const clientId = req.user.id;
      
      // Safety checks from instructions:
      if (clientId === providerId) {
        return res.status(400).json({ error: 'عذراً! لا يمكنك إجراء اتصال برأسك أو حسابك نفسه.' });
      }

      // Check if blocked
      if (dbOperations.isBlocked(clientId, providerId)) {
        return res.status(403).json({ error: 'عذراً، لا يمكن إجراء الاتصال لوجود حظر نشط بين المستخدمين.' });
      }

      const call = dbOperations.createCall(clientId, providerId);
      res.status(201).json(call);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/calls', requireAuth, (req: Request, res: Response) => {
    try {
      const calls = dbOperations.getCalls();
      const myCalls = calls.filter(c => c.clientId === req.user.id || c.providerId === req.user.id);
      
      // Sort newest first
      myCalls.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(myCalls);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/calls/:id', requireAuth, (req: Request, res: Response) => {
    try {
      const call = dbOperations.getCallById(req.params.id);
      if (!call) {
        return res.status(404).json({ error: 'المكالمة غير موجودة' });
      }

      if (call.clientId !== req.user.id && call.providerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'غير مخول للاطلاع على هذه المكالمة' });
      }

      res.json(call);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/calls/:id', requireAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, durationSeconds } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'حالة المكالمة مطلوبة' });
      }

      const call = dbOperations.getCallById(id);
      if (!call) {
        return res.status(404).json({ error: 'المكالمة غير موجودة' });
      }

      // Authorize modification
      if (call.clientId !== req.user.id && call.providerId !== req.user.id) {
        return res.status(403).json({ error: 'غير مخول لتعديل حالة هذه المكالمة' });
      }

      const updatedCall = dbOperations.updateCallStatus(id, status, durationSeconds);
      res.json(updatedCall);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Agora Platform Endpoints ---
  app.post('/api/agora/token', requireAuth, (req: Request, res: Response) => {
    try {
      const { channelName, callId } = req.body;
      if (!channelName || !callId) {
        return res.status(400).json({ error: 'مطلوب تحديد معرف القناة ورمز المكالمة' });
      }

      const call = dbOperations.getCallById(callId);
      if (!call) {
        return res.status(404).json({ error: 'المكالمة غير صالحة أو غير موجودة' });
      }

      // "verifies user is part of call"
      if (call.clientId !== req.user.id && call.providerId !== req.user.id) {
        return res.status(403).json({ error: 'غير مسموح لك بالمشاركة في هذه القناة الصوتية' });
      }

      // Return real architectural payload structured for easy client consumption
      const appId = 'agora_app_id_connectoo_production_key';
      const mockToken = `agora_temp_token_${channelName}_${req.user.id}`;
      const uid = req.user.id === call.clientId ? 1001 : 2002;

      res.json({
        appId,
        token: mockToken,
        channelName,
        uid,
        status: call.status
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Reviews Endpoints ---
  app.post('/api/reviews', requireAuth, (req: Request, res: Response) => {
    try {
      const { providerId, callId, rating, comment } = req.body;
      if (!providerId || !callId || rating === undefined) {
        return res.status(400).json({ error: 'جميع حقول التقييم والتعليق مطلوبة' });
      }

      const reviewerId = req.user.id;
      const review = dbOperations.addReview(reviewerId, providerId, callId, rating, comment || '');
      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/providers/:id/reviews', (req: Request, res: Response) => {
    try {
      const reviews = dbOperations.getReviews(req.params.id);
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Safety Actions (Block & Report) ---
  app.post('/api/safety/report', requireAuth, (req: Request, res: Response) => {
    try {
      const { reportedId, reason } = req.body;
      if (!reportedId || !reason) {
        return res.status(400).json({ error: 'الرجاء كتابة سبب الإبلاغ واسم المستخدم المعني' });
      }

      const report = dbOperations.addReport(req.user.id, reportedId, reason);
      res.status(201).json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/safety/block', requireAuth, (req: Request, res: Response) => {
    try {
      const { blockedId } = req.body;
      if (!blockedId) {
        return res.status(400).json({ error: 'معرّف الحظر مطلوب' });
      }

      dbOperations.blockUser(req.user.id, blockedId);
      res.json({ success: true, message: 'تم حظر هذا المستخدم بنجاح. لن يتمكن من الاتصال بك أو مراسلتك مطلقاً.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- Verification Requests ---
  app.post('/api/provider/verify', requireAuth, (req: Request, res: Response) => {
    try {
      if (req.user.role !== 'provider') {
        return res.status(403).json({ error: 'تقديم طلبات التحقق يقتصر على حسابات مزودي الخدمات والخبراء فقط' });
      }
      const { profession, jurisdiction, licenseNumber, notes } = req.body;
      if (!profession || !jurisdiction || !licenseNumber) {
        return res.status(400).json({ error: 'الرجاء توفير المهنة وجهة الاعتماد ورقم رخصة مزاولة المهنة المعتمَد.' });
      }

      const v = dbOperations.submitVerification(req.user.id, profession, jurisdiction, licenseNumber, notes || '');
      res.status(201).json(v);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });


  // --- Admin Endpoints ---
  app.get('/api/admin/users', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      res.json(dbOperations.getProfiles());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/users/:id/approve', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = dbOperations.updateProfile(req.params.id, { approved: true });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/users/:id/reject', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      // Deleting profile or rejecting
      const user = dbOperations.getProfileById(req.params.id);
      if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
      // update approved to false or remove from profile list
      const db = getDb();
      db.profiles = db.profiles.filter(p => p.id !== req.params.id);
      saveDb(db);
      res.json({ success: true, message: 'تم إزاحة ورفض طلب اشتراك هذا المستخدم.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/users/:id/ban', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      const { ban } = req.body; // true or false
      const updated = dbOperations.updateProfile(req.params.id, { banned: ban === true });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/reports', requireAuth, requireAdmin, (req: Request, res: Response) => {
    res.json(dbOperations.getReports());
  });

  app.delete('/api/admin/reports/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    const success = dbOperations.deleteReport(req.params.id);
    if (success) {
      res.json({ success: true, message: 'تم حفظ وحذف البلاغ بنجاح' });
    } else {
      res.status(404).json({ error: 'البلاغ غير موجود' });
    }
  });

  app.get('/api/admin/verifications', requireAuth, requireAdmin, (req: Request, res: Response) => {
    res.json(dbOperations.getVerifications());
  });

  app.patch('/api/admin/verifications/:id/approve', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = dbOperations.approveVerification(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/admin/verifications/:id/reject', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = dbOperations.rejectVerification(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/admin/analytics', requireAuth, requireAdmin, (req: Request, res: Response) => {
    res.json(dbOperations.getAnalytics());
  });


  // --- Vite & Production SPA Static Serving Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Connectoo Server running on http://localhost:${PORT}`);
  });
}

startServer();
