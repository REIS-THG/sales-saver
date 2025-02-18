
import { supabase } from "@/integrations/supabase/client";
import type { ReportConfiguration, ReportConfig, ReportVisualization } from "@/components/reports/types";
import type { Json } from "@/integrations/supabase/types";

const PAGE_SIZE = 9;

async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getSession();
  if (error || !user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function fetchUserReports(userId: string, page = 1) {
  await checkAuth();
  console.log('Fetching reports for user:', userId);
  
  const { data: reportsData, error, count } = await supabase
    .from('report_configurations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (error) {
    console.error('Error in fetchUserReports:', error);
    throw error;
  }

  const reports = (reportsData || []).map(report => {
    const config = typeof report.config === 'string' 
      ? JSON.parse(report.config) 
      : report.config;

    return {
      id: report.id,
      user_id: report.user_id,
      name: report.name,
      description: report.description || undefined,
      config: {
        dimensions: config.dimensions || [],
        metrics: config.metrics || [],
        filters: config.filters || [],
        visualization: (config.visualization || 'bar') as ReportVisualization
      },
      created_at: report.created_at,
      updated_at: report.updated_at,
      is_favorite: report.is_favorite
    };
  });

  return { reports, totalCount: count || 0 };
}

export async function createUserReport(userId: string, initialConfig: ReportConfig) {
  await checkAuth();
  console.log('Creating report for user:', userId);
  
  const newReportData = {
    name: "New Report",
    description: "Custom report description",
    user_id: userId,
    config: initialConfig as unknown as Json
  };

  const { data, error } = await supabase
    .from('report_configurations')
    .insert(newReportData)
    .select()
    .single();

  if (error) {
    console.error('Error in createUserReport:', error);
    throw error;
  }

  const config = typeof data.config === 'string' 
    ? JSON.parse(data.config) 
    : data.config;

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description || undefined,
    config: {
      dimensions: config.dimensions || [],
      metrics: config.metrics || [],
      filters: config.filters || [],
      visualization: (config.visualization || 'bar') as ReportVisualization
    },
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_favorite: data.is_favorite
  };
}

export async function updateUserReport(reportId: string, updates: Partial<ReportConfiguration>) {
  await checkAuth();
  const updateData = {
    ...updates,
    config: updates.config ? (updates.config as unknown as Json) : undefined
  };

  const { data, error } = await supabase
    .from('report_configurations')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;

  const config = typeof data.config === 'string' 
    ? JSON.parse(data.config) 
    : data.config;

  return {
    ...data,
    config: {
      dimensions: config.dimensions || [],
      metrics: config.metrics || [],
      filters: config.filters || [],
      visualization: (config.visualization || 'bar') as ReportVisualization
    }
  };
}

export async function deleteUserReport(reportId: string) {
  await checkAuth();
  const { error } = await supabase
    .from('report_configurations')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
  return true;
}

export async function toggleReportFavorite(reportId: string, currentStatus: boolean) {
  await checkAuth();
  const { data, error } = await supabase
    .from('report_configurations')
    .update({ 
      is_favorite: !currentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;

  const config = typeof data.config === 'string' 
    ? JSON.parse(data.config) 
    : data.config;

  return {
    ...data,
    config: {
      dimensions: config.dimensions || [],
      metrics: config.metrics || [],
      filters: config.filters || [],
      visualization: (config.visualization || 'bar') as ReportVisualization
    }
  };
}
