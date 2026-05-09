import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { cropService, diseaseService } from '../services/api';
export const DiseasePage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [crops, setCrops] = useState([]);
    const [selectedCropId, setSelectedCropId] = useState('');
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await cropService.getAllCrops();
                const mapped = (response.data?.data || []).map((crop) => ({
                    id: crop._id,
                    name: crop.cropName,
                }));
                setCrops(mapped);
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load crops');
            }
        };
        fetchCrops();
    }, []);
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAnalyze = async () => {
        if (!selectedImage) {
            toast.error('Please upload an image first');
            return;
        }
        if (!selectedCropId) {
            toast.error('Please select a crop');
            return;
        }
        setIsAnalyzing(true);
        try {
            const response = await diseaseService.detectDisease({
                cropId: selectedCropId,
                imageUrl: selectedImage,
            });
            const data = response.data?.data;
            const confidence = typeof data?.confidence === 'number' ? data.confidence * 100 : 0;
            const severity = confidence >= 80 ? 'high' : confidence >= 60 ? 'moderate' : 'low';
            setResult({
                disease: data?.diseaseName || 'Unknown',
                confidence,
                severity,
                description: data?.description || 'AI-powered disease detection result.',
                treatment: data?.suggestions || [],
                prevention: data?.prevention || [],
            });
            toast.success('Analysis complete!');
        }
        catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to analyze image');
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disease Detection</h1>
        <p className="text-muted-foreground">Upload crop images for AI-powered disease analysis</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Take a clear photo of the affected plant part</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={selectedCropId} onValueChange={setSelectedCropId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop"/>
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (<SelectItem key={crop.id} value={crop.id}>
                        {crop.name}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedImage ? (<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-3 text-muted-foreground"/>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </label>) : (<div className="space-y-4">
                  <div className="relative">
                    <img src={selectedImage} alt="Uploaded crop" className="w-full h-64 object-cover rounded-lg"/>
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => {
                setSelectedImage(null);
                setResult(null);
            }}>
                      Remove
                    </Button>
                  </div>
                  <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                </div>)}

              {isAnalyzing && (<div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Analyzing image with AI...</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>)}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {result ? (<Card className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Detection Results</CardTitle>
                    <CardDescription>AI-powered analysis</CardDescription>
                  </div>
                  <Badge className={getSeverityColor(result.severity)}>
                    {result.severity} severity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600"/>
                    <h3 className="font-bold text-red-900 dark:text-red-100">
                      Detected: {result.disease}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <span>Confidence:</span>
                    <Progress value={result.confidence} className="flex-1"/>
                    <span>{Math.round(result.confidence)}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommended Treatment</h4>
                  <ul className="space-y-2">
                    {result.treatment.map((step, index) => (<li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"/>
                        <span>{step}</span>
                      </li>))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prevention Tips</h4>
                  <ul className="space-y-2">
                    {result.prevention.map((tip, index) => (<li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"/>
                        <span>{tip}</span>
                      </li>))}
                  </ul>
                </div>
              </CardContent>
            </Card>) : (<Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground"/>
                <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Upload and analyze an image to see disease detection results
                </p>
              </CardContent>
            </Card>)}
        </motion.div>
      </div>
    </div>);
};
