# Web application for data analysis

This application is developed in Flask web framework and provides some functionalities about data analysis.

The data analysis that are implemented in the application are developed in R. Basically the concept is, you make your analysis in R, you test it with different datasets and when you are sure that is stable, then you upload the R script on your server to make the analysis available for everyone. 

The web application give you the possibilities to create an interface from the user and the analysis.



### Detail

Before to introduce an example I have to give you some advice about the application.

- The application is structured to integrate data analysis developed in R. You can find more detail about R language [here](https://www.r-project.org/).
- Every analysis is represented from a script like [this one](rscripts/Serie_Storica/Serie_Storica.R).
- Every analysis require a dataset to execute some operation and returned the results, at the moment the only type of dataset supported is *CSV*.
- The results returned from an analysis can be *CSV, Pdf, Png, Jpeg*, anyway depends from the implementation of the R script.

### Example of use

Now I will show you how you can use this application. Let's suppose you have the following [analysis](rscripts/Serie_Storica/Serie_Storica.R) and you want to integrate in the web application. The analysis should be followed by two *JSON* files.

- [script_info.json](rscripts/Serie_Storica/script_info.json), that give more informations about the analysis.
- [parameters.json](rscripts/Serie_Storica/parameters.json), that is used to request some parameters to the user. This parameters affect the execution of the analysis. (always depends from the implementation)

In the following page you can do:

- Upload new dataset in *CSV* format. This will be save in MongoDB.
- Select the analysis that you want to execute.
- Select the dataset that are presents on your account.

![](/home/angelo/Desktop/img1.png)



One useful function is when you select one dataset from the list, this will be upload on the browser so you can see if should be fine or if contains the expected data.

![](/home/angelo/Desktop/img2.png)



When you press *Start calculation*, you will be redirect to the following page where are requested some parameters to affect the execution of the analysis. 



![](/home/angelo/Desktop/img3.png)



In this example the parameters requested correspond respectively to:

- Plot of data represent an historic series.
- Plot of the linear regression about the historic series data.

Both plots are generated from the R script and are saved in the *cache* directory. Moreover the plots are *Pdf* files.

Finally, when you press the *Start calculation* button all the parameters are send to the server side that can provide to execute the R script as a subprocess.

Here are reported some results generated from the analysis that doesn't do anything special, just analyze an historic series.

![](/home/angelo/Documents/Thesis/Thesis_Latex/Figures/data2.png)



![](/home/angelo/Documents/Thesis/Thesis_Latex/Figures/data1.png)



### Future Developments

- Implement token authentication
- Improve feedback from R script
- Improve user experience
- Extend support to other file extension