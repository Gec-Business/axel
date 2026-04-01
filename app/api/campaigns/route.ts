import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllCampaigns, createCampaign, addAuditLog } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get('status') || undefined,
    pillar: searchParams.get('pillar') || undefined,
  };

  const campaigns = await getAllCampaigns(filters);
  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const campaign = await createCampaign({
    name: body.name,
    name_ka: body.name_ka || null,
    description: body.description || null,
    pillar: body.pillar || 'general',
    start_date: body.start_date,
    end_date: body.end_date,
    status: body.status || 'planning',
  });

  if (campaign) {
    await addAuditLog('campaign_created', 'campaign', campaign.id);
  }

  return NextResponse.json(campaign, { status: 201 });
}
