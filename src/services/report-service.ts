
import { supabase } from "@/integrations/supabase/client";
import type { ReportConfiguration, ReportConfig, ReportVisualization } from "@/components/reports/types";
import type { Json } from "@/integrations/supabase/types";

const PAGE_SIZE = 9;

export async function fetchUserReports(userId: string, page = 1) {
  console.log('Fetching reports for user:', userId);
  console.log('Fetching reports for page:', page);
  
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  // Remove any references to team-related data
  const { data: reportsData, error, count } = await supabase
    .from('report_configurations')
    .select(`
      id,
      user_id,
      name,
      description,
      config,
      created_at,
      updated_at,
      is_favorite
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error in fetchUserReports:', error);
    throw error;
  }

  const reports = (reportsData || []).map(report => ({
    id: report.id,
    user_id: report.user_id,
    name: report.name || 'Untitled Report',
    description: report.description || undefined,
    config: {
      dimensions: (report.config as any)?.dimensions || [],
      metrics: (report.config as any)?.metrics || [],
      filters: (report.config as any)?.filters || [],
      visualization: ((report.config as any)?.visualization || 'bar') as ReportVisualization
    },
    created_at: report.created_at,
    updated_at: report.updated_at,
    is_favorite: report.is_favorite || false
  }));

  return { reports, totalCount: count || 0 };
}

export async function createUserReport(userId: string, initialConfig: ReportConfig) {
  console.log('Creating report for user:', userId);
  
  const newReportData = {
    name: "New Report",
    description: "Custom report description",
    user_id: userId,
    config: initialConfig as unknown as Json
  };

  const { data, error } = await supabase
    .from('report_configurations')
    .insert([newReportData])
    .select(`
      id,
      user_id,
      name,
      description,
      config,
      created_at,
      updated_at,
      is_favorite
    `)
    .single();

  if (error) {
    console.error('Error in createUserReport:', error);
    throw error;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description || undefined,
    config: {
      dimensions: (data.config as any)?.dimensions || [],
      metrics: (data.config as any)?.metrics || [],
      filters: (data.config as any)?.filters || [],
      visualization: ((data.config as any)?.visualization || 'bar') as ReportVisualization
    },
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_favorite: data.is_favorite || false
  };
}

export async function updateUserReport(reportId: string, updates: Partial<ReportConfiguration>) {
  const updateData = {
    ...updates,
    config: updates.config ? (updates.config as unknown as Json) : undefined
  };

  const { data, error } = await supabase
    .from('report_configurations')
    .update(updateData)
    .eq('id', reportId)
    .select(`
      id,
      user_id,
      name,
      description,
      config,
      created_at,
      updated_at,
      is_favorite
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description || undefined,
    config: {
      dimensions: (data.config as any)?.dimensions || [],
      metrics: (data.config as any)?.metrics || [],
      filters: (data.config as any)?.filters || [],
      visualization: ((data.config as any)?.visualization || 'bar') as ReportVisualization
    },
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_favorite: data.is_favorite || false
  };
}

export async function deleteUserReport(reportId: string) {
  const { error } = await supabase
    .from('report_configurations')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
  return true;
}

export async function toggleReportFavorite(reportId: string, currentStatus: boolean) {
  const { data, error } = await supabase
    .from('report_configurations')
    .update({ 
      is_favorite: !currentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .select(`
      id,
      user_id,
      name,
      description,
      config,
      created_at,
      updated_at,
      is_favorite
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description || undefined,
    config: {
      dimensions: (data.config as any)?.dimensions || [],
      metrics: (data.config as any)?.metrics || [],
      filters: (data.config as any)?.filters || [],
      visualization: ((data.config as any)?.visualization || 'bar') as ReportVisualization
    },
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_favorite: data.is_favorite || false
  };
}
