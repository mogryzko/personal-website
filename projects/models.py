from django.db import models

# Create your models here.

class Project(models.Model):
	title = models.CharField(max_length=100)
	main_img = models.ImageField(blank=True)
	image2 = models.ImageField(blank=True)
	image3 = models.ImageField(blank=True)
	image4 = models.ImageField(blank=True)
	slug = models.SlugField()
	teaser = models.TextField()
	description = models.TextField(blank=True)
	date = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.title

