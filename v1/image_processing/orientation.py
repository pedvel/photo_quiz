from PIL import ExifTags, Image



def correct_image_orientation(img):
    try:
        # Get Exif orientation data
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = img._getexif()
        if exif is not None and orientation in exif:
            orientation_value = exif[orientation]
            if orientation_value == 3:  # 180 degrees
                img = img.rotate(180, expand=True)
            elif orientation_value == 6:  # 90 degrees clockwise
                img = img.rotate(270, expand=True)
            elif orientation_value == 8:  # 90 degrees counter-clockwise
                img = img.rotate(90, expand=True)
    except Exception as e:
        print(f"Error correcting image orientation: {e}")
    return img