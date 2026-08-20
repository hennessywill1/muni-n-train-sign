import fetch from 'node-fetch';
import xml2js from 'xml2js';

const parser = new xml2js.Parser();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const STOP_ID = '13911';
    const ROUTE = 'N';
    const AGENCY = 'sfmta';
    
    const url = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=${AGENCY}&stopId=${STOP_ID}&routeTag=${ROUTE}`;
    
    const response = await fetch(url);
    const xml = await response.text();
    
    const data = await parser.parseStringPromise(xml);
    
    const predictions = [];
    
    if (data.predictions && data.predictions.direction) {
      const directions = Array.isArray(data.predictions.direction) 
        ? data.predictions.direction 
        : [data.predictions.direction];
      
      directions.forEach(direction => {
        const dirTag = direction.$.tag || '';
        const isDowntown = dirTag.toLowerCase().includes('downtown') || 
                          dirTag.toLowerCase().includes('embarcadero') ||
                          dirTag.toLowerCase().includes('inbound') ||
                          dirTag.toLowerCase().includes('dtx');
        
        if (isDowntown && direction.prediction) {
          const preds = Array.isArray(direction.prediction) 
            ? direction.prediction 
            : [direction.prediction];
          
          preds.forEach(pred => {
            const minutes = parseInt(pred.$.minutes);
            const vehicle = pred.$.vehicle;
            
            if (!isNaN(minutes)) {
              predictions.push({
                minutes: minutes,
                vehicle: vehicle
              });
            }
          });
        }
      });
    }
    
    // If no downtown trains, return all trains
    if (predictions.length === 0 && data.predictions && data.predictions.direction) {
      const directions = Array.isArray(data.predictions.direction) 
        ? data.predictions.direction 
        : [data.predictions.direction];
      
      directions.forEach(direction => {
        if (direction.prediction) {
          const preds = Array.isArray(direction.prediction) 
            ? direction.prediction 
            : [direction.prediction];
          
          preds.forEach(pred => {
            const minutes = parseInt(pred.$.minutes);
            const vehicle = pred.$.vehicle;
            
            if (!isNaN(minutes)) {
              predictions.push({
                minutes: minutes,
                vehicle: vehicle
              });
            }
          });
        }
      });
    }
    
    // Sort by minutes
    predictions.sort((a, b) => a.minutes - b.minutes);
    
    res.status(200).json(predictions.slice(0, 4));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals', details: error.message });
  }
}
