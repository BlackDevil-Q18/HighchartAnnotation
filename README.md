# HighchartAnnotation
Quick annotation plugin for Highcharts

<p>
Included features :-
1. Text annotation
2. Line marker
3. Area indicator
</p>
<p>
Depedency :-</br>
  1) Jquery</br>
  2) Promise polyfill for some browsers(eg. IE9)</br>
</p>
</br>
<img src="./ezgif.com-video-to-gif (1).gif"></img>

<img src="./ezgif.com-video-to-gif.gif"></img>
</br>
<p>
How to Use it:-</br>
Step 1 : Include script and css</br>
        <pre>
          //script src="./highchart.annotation.js"
          //link rel="stylesheet" href="./css/highchart.annotation.css"
        </pre>
        </br>
Step 2 : Have following Highchart Container HTML Structure</br>
          <pre>
            div id="highchartContainerParent"
              div id="highchartContainer"
          </pre>
          </br>
Step 3 : Get highchart refernece chartObj</br>
<pre>
        var chartObj = new Highcharts.Chart({
                      ........
                      });
                      
</pre>
</br>
Step 4 : Use *chartObj, *#highchartContainerParent, *enableAnnotationbutton, to create HighchartAnnotation object.</br>
<pre>
  new HighchartAnnotation(chartObj,toggleActionbtn,highchartContainerParent)
</pre>
