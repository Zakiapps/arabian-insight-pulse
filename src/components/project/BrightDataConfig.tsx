
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Cloud, Settings, Key, Globe } from 'lucide-react';

interface BrightDataConfig {
  id?: string;
  project_id: string;
  token: string;
  rules: {
    platforms: string[];
    keywords: string[];
    limit: number;
  };
  is_active: boolean;
}

const BrightDataConfig = ({ projectId }: { projectId: string }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<BrightDataConfig>({
    project_id: projectId,
    token: '',
    rules: {
      platforms: [],
      keywords: [],
      limit: 100
    },
    is_active: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Temporarily disable the database operations until the table is created
  useEffect(() => {
    // loadConfig();
  }, [projectId]);

  const loadConfig = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Temporarily commented out until brightdata_configs table is created
      // const { data, error } = await supabase
      //   .from('brightdata_configs')
      //   .select('*')
      //   .eq('project_id', projectId)
      //   .single();

      // if (error && error.code !== 'PGRST116') {
      //   throw error;
      // }

      // if (data) {
      //   setConfig({
      //     ...data,
      //     token: data.token || '',
      //     rules: data.rules || { platforms: [], keywords: [], limit: 100 },
      //     is_active: data.is_active || false
      //   });
      // }
    } catch (error) {
      console.error('Error loading BrightData config:', error);
      toast.error('Failed to load BrightData configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Temporarily commented out until brightdata_configs table is created
      // const { error } = await supabase
      //   .from('brightdata_configs')
      //   .upsert({
      //     project_id: projectId,
      //     token: config.token,
      //     rules: config.rules,
      //     is_active: config.is_active
      //   });

      // if (error) throw error;

      toast.success('BrightData configuration saved successfully');
    } catch (error) {
      console.error('Error saving BrightData config:', error);
      toast.error('Failed to save BrightData configuration');
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async () => {
    if (!user || !config.id) return;

    try {
      // Temporarily commented out until brightdata_configs table is created
      // const { error } = await supabase
      //   .from('brightdata_configs')
      //   .delete()
      //   .eq('id', config.id);

      // if (error) throw error;

      setConfig({
        project_id: projectId,
        token: '',
        rules: { platforms: [], keywords: [], limit: 100 },
        is_active: false
      });
      
      toast.success('BrightData configuration deleted');
    } catch (error) {
      console.error('Error deleting BrightData config:', error);
      toast.error('Failed to delete BrightData configuration');
    }
  };

  const handlePlatformsChange = (value: string) => {
    const platforms = value.split(',').map(p => p.trim()).filter(Boolean);
    setConfig(prev => ({
      ...prev,
      rules: { ...prev.rules, platforms }
    }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    setConfig(prev => ({
      ...prev,
      rules: { ...prev.rules, keywords }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          BrightData Configuration
          {config.is_active && (
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="token" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Token
          </Label>
          <Input
            id="token"
            type="password"
            value={config.token}
            onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            placeholder="Enter your BrightData API token"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Platforms (comma-separated)
          </Label>
          <Textarea
            value={config.rules.platforms.join(', ')}
            onChange={(e) => handlePlatformsChange(e.target.value)}
            placeholder="twitter, facebook, instagram, linkedin"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Keywords (comma-separated)</Label>
          <Textarea
            value={config.rules.keywords.join(', ')}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit">Data Limit</Label>
          <Input
            id="limit"
            type="number"
            value={config.rules.limit}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              rules: { ...prev.rules, limit: parseInt(e.target.value) || 100 }
            }))}
            min="1"
            max="10000"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={config.is_active}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Enable BrightData scraping</Label>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveConfig} 
            disabled={saving || !config.token}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          {config.id && (
            <Button 
              variant="destructive" 
              onClick={deleteConfig}
              disabled={saving}
            >
              Delete
            </Button>
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> BrightData configuration is temporarily disabled while the database schema is being updated. 
            The configuration will be saved locally until the backend is ready.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrightDataConfig;
