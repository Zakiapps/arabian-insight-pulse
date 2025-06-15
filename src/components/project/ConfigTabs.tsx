
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import BrightDataConfig from './BrightDataConfig';
import NewsDataConfig from './NewsDataConfig';
import TextSummarizer from './TextSummarizer';
import { Globe, Newspaper, FileText } from 'lucide-react';

interface ConfigTabsProps {
  projectId: string;
}

const ConfigTabs = ({ projectId }: ConfigTabsProps) => {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('brightdata');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="brightdata" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>BrightData</span>
        </TabsTrigger>
        <TabsTrigger value="newsdata" className="flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          <span>NewsData.io</span>
        </TabsTrigger>
        <TabsTrigger value="summarizer" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{isRTL ? 'الملخص' : 'Summarizer'}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="brightdata">
        <BrightDataConfig projectId={projectId} />
      </TabsContent>
      
      <TabsContent value="newsdata">
        <NewsDataConfig projectId={projectId} />
      </TabsContent>
      
      <TabsContent value="summarizer">
        <TextSummarizer />
      </TabsContent>
    </Tabs>
  );
};

export default ConfigTabs;
